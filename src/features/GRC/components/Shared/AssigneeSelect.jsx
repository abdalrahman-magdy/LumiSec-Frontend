import React from "react";

function getAssigneeId(user) {
  return user?._id ?? user?.id;
}

function formatAssigneeLabel(user) {
  const name = user?.name || "Unknown user";
  const email = user?.email ? ` (${user.email})` : "";
  return `${name}${email}`;
}

export default function AssigneeSelect({
  id,
  value,
  onChange,
  assignees = [],
  required = false,
  disabled = false,
  allowEmpty = false,
  emptyLabel = "Unassigned",
  className = "form-select bg-dark text-white border-0",
}) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      disabled={disabled || assignees.length === 0}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {!allowEmpty && assignees.length === 0 && (
        <option value="">No users available</option>
      )}
      {assignees.map((user) => {
        const assigneeId = getAssigneeId(user);
        return (
          <option key={assigneeId} value={assigneeId}>
            {formatAssigneeLabel(user)}
          </option>
        );
      })}
    </select>
  );
}
