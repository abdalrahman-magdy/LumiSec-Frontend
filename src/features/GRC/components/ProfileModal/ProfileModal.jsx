import React, { useCallback, useEffect, useState } from 'react'
import "./ProfileModal.css"
import { getProfile, updateProfile } from '../../../../services/auth.api'
import { useAuth } from '../../../auth/context/AuthContext'

const initialForm = {
    name: "",
    email: "",
    role: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
};

export default function ProfileModal() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile();
      const profile = result.user ?? result.data;
      setForm((prev) => ({
        ...prev,
        name: profile?.name ?? "",
        email: profile?.email ?? "",
        role: profile?.role ?? "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (form.password && form.password !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      setSaving(false);
      return;
    }

    if (form.password && !form.currentPassword) {
      setError("Enter your current password to set a new password.");
      setSaving(false);
      return;
    }

    const payload = { name: form.name.trim() };
    if (form.password) {
      payload.password = form.password;
      payload.currentPassword = form.currentPassword;
    }

    try {
      const result = await updateProfile(payload);
      const profile = result.user ?? result.data;
      updateUser(profile);
      setForm((prev) => ({
        ...prev,
        name: profile?.name ?? prev.name,
        email: profile?.email ?? prev.email,
        role: profile?.role ?? prev.role,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
      setSuccess(result.message || "Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return <>
  <div className='profile rounded-3 mb-5'>
    {loading && <p className='text-white p-3 mb-0'>Loading profile...</p>}
    {!loading && (
    <form className='p-3' onSubmit={handleSubmit}>
        {error && <p className='text-danger mb-3'>{error}</p>}
        {success && <p className='text-success mb-3'>{success}</p>}

        <label htmlFor="name" className='mb-2'>Full Name</label>
        <input
            type="text"
            id="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder='Enter Full Name'
            className='form-control border-0 mb-2'
            required
        />

        <label htmlFor="email" className='mb-2'>Email Address</label>
        <input
            type="email"
            id="email"
            value={form.email}
            className='form-control border-0 mb-2'
            readOnly
            disabled
        />

        <label htmlFor="role" className='mb-2'>Role</label>
        <input
            type="text"
            id="role"
            value={form.role}
            className='form-control border-0 mb-2 text-capitalize'
            readOnly
            disabled
        />

        <hr />

        <label htmlFor="currentPassword" className='mb-2'>Current Password</label>
        <input
            type="password"
            id="currentPassword"
            value={form.currentPassword}
            onChange={(event) => updateField("currentPassword", event.target.value)}
            placeholder='Required only when changing password'
            className='form-control border-0 mb-3'
            autoComplete="current-password"
        />

        <label htmlFor="password" className='mb-2'>New Password</label>
        <input
            type="password"
            id="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder='Leave blank to keep current password'
            className='form-control border-0 mb-3'
            autoComplete="new-password"
        />

        <label htmlFor="confirmPassword" className='mb-2'>Confirm Password</label>
        <input
            type="password"
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder='Confirm new password'
            className='form-control border-0 mb-4'
            autoComplete="new-password"
        />

        <div className='d-flex justify-content-end'>
            <button
                type="submit"
                className='save-btn p-2 rounded-3 text-white border-0'
                disabled={saving}
            >
                <i className="fa-solid fa-floppy-disk pe-2"></i>
                {saving ? "Saving..." : "Save Profile"}
            </button>
        </div>
    </form>
    )}
  </div>
  </>
}
