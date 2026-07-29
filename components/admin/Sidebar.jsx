import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const { permissions, loading } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const menuItems = useMemo(
    () => [
      {
        name: "Dashboard",
        subMenu: [
          {
            name: "Overview",
            link: "/admin",
            module: "dashboard",
            action: "view",
          },
        ],
      },
      {
        name: "Customer Management",
        subMenu: [
          {
            name: "Customers",
            link: "/admin/customers",
            module: "customers",
            action: "view",
          },
        ],
      },
      {
        name: "Service Provider Management",
        subMenu: [
          {
            name: "Service Providers",
            link: "/admin/service-providers",
            module: "service_providers",
            action: "view",
          },
          {
            name: "Inquiry Applications",
            link: "/admin/inquiry",
            module: "inquiries",
            action: "view",
          },
        ],
      },
      {
        name: "Bookings Management",
        subMenu: [
          {
            name: "Bookings",
            link: "/admin/bookings",
            module: "bookings",
            action: "view",
          },
          {
            name: "Manual Booking Assignment",
            link: "/admin/manually_asignment",
            module: "bookings",
            action: "assign",
          },
          {
            name: "Payment Failed Bookings",
            link: "/admin/bookings/payment-failed-bookings",
            module: "bookings",
            action: "view",
          },
          {
            name: "Customer Cancelled Bookings",
            link: "/admin/bookings/canceled-bokings",
            module: "bookings",
            action: "view",
          },
          {
            name: "Provider Cancelled Bookings",
            link: "/admin/bookings/provider-canceled-bokings",
            module: "bookings",
            action: "view",
          },
        ],
      },
      {
        name: "Payments Management",
        subMenu: [
          {
            name: "Transactions History",
            link: "/admin/transactions",
            module: "transactions",
            action: "view",
          },
          {
            name: "Payouts",
            link: "/admin/provider-payouts",
            module: "payouts",
            action: "view",
          },
        ],
      },
      {
        name: "Ticket Management",
        subMenu: [
          {
            name: "Tickets",
            link: "/admin/tickets",
            module: "tickets",
            action: "view",
          },
        ],
      },
      {
        name: "Services Management",
        subMenu: [
          {
            name: "Services List",
            link: "/admin/services",
            module: "services",
            action: "view",
          },
          {
            name: "Coupons",
            link: "/admin/coupons",
            module: "coupons",
            action: "view",
          },
        ],
      },
      {
        name: "Banners Management",
        subMenu: [
          {
            name: "Banners List",
            link: "/admin/banners",
            module: "banners",
            action: "view",
          },
        ],
      },
      {
        name: "Notifications Management",
        subMenu: [
          {
            name: "Promotional Notifications",
            link: "/admin/notifications",
            module: "notifications",
            action: "view",
          },
        ],
      },
      {
        name: "Content Management",
        subMenu: [
          {
            name: "Documents",
            link: "/admin/documents",
            module: "documents",
            action: "view",
          },
        ],
      },
      {
        name: "Settings",
        subMenu: [
          {
            name: "Admin Management",
            link: "/admin/admin-management",
            module: "admin_management",
            action: "view",
          },
          {
            name: "Reset Password",
            link: "/admin/reset-password",
            module: "settings",
            action: "view",
          },
          {
            name: "System Settings",
            link: "/admin/system-settings",
            module: "settings",
            action: "view",
          },
          {
            name: "Version Control",
            link: "/admin/version-control",
            module: "versions",
            action: "view",
          },
          {
            name: "City Mangement",
            link: "/admin/cities",
            module: "cities",
            action: "view",
          },
          {
            name: "City Mappings",
            link: "/admin/city-mappings",
            module: "city_mappings",
            action: "view",
          },
        ],
      },
      {
        name: "Logs",
        subMenu: [
          {
            name: "Administrator Logs",
            link: "/administrator-logs",
            module: "logs",
            action: "view",
          },
          {
            name: "Service Provider Logs",
            link: "/service-provider-logs",
            module: "logs",
            action: "view",
          },
        ],
      },
    ],
    []
  );

  const isAllowed = (module, action) => {
    if (!permissions) return false;
    const modulePerm = permissions[module];
    if (modulePerm === true) return true;
    if (modulePerm && typeof modulePerm === "object") {
      if (!action) return true;
      return modulePerm[action] === true;
    }
    return false;
  };

  const allowedMenu = useMemo(() => {
    if (!permissions) return [];

    return menuItems
      .map((item) => {
        const allowedSub = item.subMenu.filter((sub) =>
          isAllowed(sub.module, sub.action)
        );
        return allowedSub.length > 0 ? { ...item, subMenu: allowedSub } : null;
      })
      .filter(Boolean);
  }, [permissions, menuItems]);

  const renderMenuItems = permissions ? allowedMenu : [];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-lg z-50 transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-80"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-800">[App Name]</h1>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && renderMenuItems.length === 0 && (
              <div className="text-sm text-gray-500">No modules assigned.</div>
            )}

            {!loading &&
              renderMenuItems.map((item, idx) => (
                <div key={idx} className="mb-2">
                  {sidebarCollapsed ? (
                    // Collapsed view - show only icons/first letters
                    <div className="relative group">
                      <button className="w-full p-3 text-center bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors duration-200">
                        <span className="text-sm font-bold">
                          {item.name.charAt(0)}
                        </span>
                      </button>

                      {/* Tooltip on hover */}
                      <div className="absolute left-16 top-0 invisible group-hover:visible bg-gray-800 text-white text-sm rounded-md py-1 px-2 whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    </div>
                  ) : (
                    // Expanded view - full menu
                    <>
                      <button
                        onClick={() => toggleExpanded(idx)}
                        className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors duration-200"
                      >
                        <span className="text-sm">{item.name}</span>
                        {expandedItems[idx] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedItems[idx] && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.subMenu.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.link}
                              className="block p-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">[App Name]</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && renderMenuItems.length === 0 && (
              <div className="text-sm text-gray-500">No modules assigned.</div>
            )}

            {!loading &&
              renderMenuItems.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors duration-200"
                  >
                    <span className="text-sm">{item.name}</span>
                    {expandedItems[idx] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedItems[idx] && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.subMenu.map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          href={subItem.link}
                          onClick={() => setSidebarOpen(false)}
                          className="block p-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
