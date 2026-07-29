"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { profileAPI } from "@/api/profile";
import { providerAPI } from "@/api/provider";
import {
  Search,
  X,
  Users,
  Loader2,
  UserCircle2,
  Wrench,
  CheckCircle2,
} from "lucide-react";

export default function UserSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedUserIds = [],
}) {
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("customers");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(selectedUserIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userType, currentPage]);

  useEffect(() => {
    // Reset to page 1 when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      const filters = {
        page: currentPage,
        limit: 10,
        search: search,
      };

      if (userType === "customers") {
        response = await profileAPI.getAllCustomers(filters);
        if (response.data?.customers) {
          setUsers(response.data.customers);
          setTotalPages(response.data.totalPages || 1);
        }
      } else if (userType === "providers") {
        response = await providerAPI.getProviders(filters, currentPage);
        if (response.data?.providers) {
          setUsers(response.data.providers);
          setTotalPages(response.data.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentPageUserIds = users.map((user) => user.u_id || user.user_id);
    const allSelected = currentPageUserIds.every((id) =>
      selectedUsers.includes(id)
    );

    if (allSelected) {
      // Deselect all on current page
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentPageUserIds.includes(id))
      );
    } else {
      // Select all on current page
      const newIds = currentPageUserIds.filter(
        (id) => !selectedUsers.includes(id)
      );
      setSelectedUsers((prev) => [...prev, ...newIds]);
    }
  };

  const handleConfirm = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }
    onConfirm(selectedUsers);
    onClose();
  };

  const handleClear = () => {
    setSelectedUsers([]);
  };

  const getUserId = (user) => user.u_id || user.user_id;

  const isUserSelected = (user) => {
    const userId = getUserId(user);
    return selectedUsers.includes(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Users for Notification
          </DialogTitle>
          <DialogDescription>
            Choose specific users to receive the promotional notification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4" />
                      <span>Customers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="providers">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Service Providers</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            {selectedUsers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Users Table */}
          <div className="border rounded-lg flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        users.length > 0 &&
                        users.every((user) => isUserSelected(user))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        Loading users...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const userId = getUserId(user);
                    return (
                      <TableRow key={userId}>
                        <TableCell>
                          <Checkbox
                            checked={isUserSelected(user)}
                            onCheckedChange={() => handleToggleUser(userId)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.name || "N/A"}
                        </TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>{user.mobile || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status || "Unknown"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedUsers.length === 0}>
            Confirm Selection ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
