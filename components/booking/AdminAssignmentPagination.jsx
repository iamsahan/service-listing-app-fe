"use client";
import React from "react";
import { Button } from "@/components/ui/button";

const AdminAssignmentPagination = ({ pagination, onPageChange }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-sm text-gray-600">
        Showing page {pagination.current_page || 1} of{" "}
        {pagination.total_pages || 1}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          disabled={!pagination.has_prev_page}
          onClick={() => onPageChange(pagination.prev_page)}
          className="flex items-center gap-2"
        >
          <span>← Previous</span>
        </Button>
        <div className="flex items-center gap-1">
          {pagination.total_pages &&
            pagination.total_pages > 0 &&
            [...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.current_page;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
        </div>
        <Button
          variant="outline"
          disabled={!pagination.has_next_page}
          onClick={() => onPageChange(pagination.next_page)}
          className="flex items-center gap-2"
        >
          <span>Next →</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminAssignmentPagination;
