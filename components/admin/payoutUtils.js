// Constants
export const PAGE_LIMIT = 10;

// Badge styling functions
export const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    processing: "bg-blue-100 text-blue-800",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

export const directionBadge = (d) => {
  const map = {
    provider_owes: "bg-red-100 text-red-700",
    platform_owes: "bg-emerald-100 text-emerald-700",
    qp_to_sp: "bg-red-100 text-red-700", // QProz owes Service Provider - RED
    sp_to_qp: "bg-emerald-100 text-emerald-700", // Service Provider owes QProz - GREEN
    balanced: "bg-gray-100 text-gray-600",
  };
  return map[d] || "bg-gray-100 text-gray-600";
};

export const getDirectionText = (direction) => {
  const map = {
    qp_to_sp: "QP to SP",
    sp_to_qp: "SP to QP",
    platform_owes: "Platform Owes",
    provider_owes: "Provider Owes",
    balanced: "Balanced",
  };
  return map[direction] || direction || "—";
};

// Helper utility functions
export const fmt = (val) =>
  val === 0 || val ? `₹${Number(val).toFixed(2)}` : "—";
export const formatDate = (dt) => (dt ? new Date(dt).toLocaleString() : "—");

// Helper components
export const Th = ({ children }) => (
  <th className="px-4 py-3 text-left font-semibold">{children}</th>
);

export const Td = ({ children }) => (
  <td className="px-4 py-3 align-top whitespace-nowrap text-gray-700">
    {children}
  </td>
);

export const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-600 text-sm font-medium">{label}:</span>
    <span className="text-gray-800 text-sm text-right">{value || "—"}</span>
  </div>
);

export const SummaryCard = ({ title, value, loading }) => (
  <div className="p-4 rounded-lg bg-white shadow border border-gray-100 flex flex-col">
    <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
      {title}
    </span>
    <span className="mt-2 text-lg font-semibold text-gray-800">
      {loading ? "…" : value ?? "—"}
    </span>
  </div>
);

// Confirmation Dialog Component
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  isLoading = false,
  showInputs = false,
  inputValues = {},
  onInputChange = () => {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>

        {showInputs && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={inputValues.reference_number || ""}
                onChange={(e) =>
                  onInputChange("reference_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reference number"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={inputValues.notes || ""}
                onChange={(e) => onInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter additional notes"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
