"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@src/context/AuthContext";
import { Menu } from "lucide-react";
import Modal from "react-modal";

const Header = ({ setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  const [showLogout, setShowLogout] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors duration-200"
          />
        </div>

        {/* User menu */}
        <div
          className="relative"
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200">
            <span className="text-white font-medium">A</span>
          </div>

          {showLogout && (
            <div
              className="absolute top-12 right-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 px-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setConfirmLogout(true)}
            >
              <span className="text-gray-700 text-sm">Logout</span>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={confirmLogout}
        onRequestClose={() => setConfirmLogout(false)}
        ariaHideApp={false}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Logout
          </h3>
          <p className="text-gray-600">Are you sure you want to Logout?</p>
          <div className="flex space-x-3">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1 transition-colors duration-200"
              onClick={handleLogout}
            >
              Yes, Logout
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex-1 transition-colors duration-200"
              onClick={() => setConfirmLogout(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
