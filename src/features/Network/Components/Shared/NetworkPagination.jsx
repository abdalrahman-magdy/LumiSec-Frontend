import React from "react";

export default function NetworkPagination({
  page = 1,
  pages = 1,
  total = 0,
  onPageChange,
  disabled = false,
}) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 px-2 flex-wrap gap-2">
      <small className="text-secondary">
        Page {page} of {pages} ({total} total)
      </small>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          disabled={disabled || page >= pages}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
