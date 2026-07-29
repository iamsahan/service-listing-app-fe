"use client";
import React from "react";
import { Edit2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ADMIN_ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
  customer_manager: "Customer Manager",
};

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-300",
  admin: "bg-blue-100 text-blue-800 border-blue-300",
  moderator: "bg-green-100 text-green-800 border-green-300",
  customer_manager: "bg-amber-100 text-amber-800 border-amber-300",
};

const AdminUserTable = ({
  users,
  currentUserRole,
  onEditRole,
  onDeactivate,
  canManage,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No admin users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mobile || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={ROLE_COLORS[user.role] || ""}
                  >
                    {ADMIN_ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditRole(user)}
                      disabled={!canManage(user.role)}
                      title={
                        canManage(user.role)
                          ? "Edit role"
                          : "Cannot manage this user"
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeactivate(user)}
                      disabled={!canManage(user.role) || !user.is_active}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title={
                        !canManage(user.role)
                          ? "Cannot manage this user"
                          : !user.is_active
                            ? "Already inactive"
                            : "Deactivate user"
                      }
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserTable;
