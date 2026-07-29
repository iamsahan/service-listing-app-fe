export default function Pagination({ page, totalPages, onPageChange }) {
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-1 text-sm text-gray-700">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoBack}
        className={`px-3 py-1 rounded ${
          canGoBack
            ? "hover:bg-gray-100 text-[#5f60b9]"
            : "text-gray-400 cursor-not-allowed"
        }`}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoForward}
        className={`px-3 py-1 rounded ${
          canGoForward
            ? "hover:bg-gray-100 text-[#5f60b9]"
            : "text-gray-400 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </div>
  );
}
