import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./PhishingShared.css";

export default function PhishingConfirmModal({
  show,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  loading = false,
  error = null,
}) {
  useEffect(() => {
    if (!show) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading && onClose) onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [show, loading, onClose]);

  if (!show) return null;

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show phishing-confirm-backdrop"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        className="modal fade show d-block phishing-confirm-modal"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phishingConfirmTitle"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content phishing-confirm-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title text-white" id="phishingConfirmTitle">
                {title}
              </h5>
              {!loading && (
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={onClose}
                />
              )}
            </div>
            <div className="modal-body border-0">
              {error && <p className="text-danger mb-3">{error}</p>}
              <p className="text-secondary mb-0">{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0 gap-2">
              <button
                type="button"
                className="btn phishing-outline-btn"
                onClick={onClose}
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="btn phishing-delete-btn-solid"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin me-1" aria-hidden />
                    Deleting...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
