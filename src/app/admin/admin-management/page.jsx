"use client";
import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Users, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { AdminUserService } from "@/api/adminUserService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminUserTable from "@/components/admin/AdminManagement/AdminUserTable";
import CreateAdminDialog from "@/components/admin/AdminManagement/CreateAdminDialog";
import EditRoleDialog from "@/components/admin/AdminManagement/EditRoleDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "@/hooks/use-toast";
import withAdminAuth from "@/components/withAdminAuth";

const ROLE_HIERARCHY = {
  super_admin: 3,
  admin: 2,
  customer_manager: 1.5,
  moderator: 1,
};

const AdminManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byRole: {},
  });

  const canManageRole = useCallback(
    (targetRole) => {
      if (!currentUser) return false;
      if (currentUser.role === "super_admin") return true;

      const currentLevel = ROLE_HIERARCHY[currentUser.role] || 0;
      const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

      return currentLevel > targetLevel;
    },
    [currentUser],
  );

  const getAvailableRoles = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin") {
      return Object.keys(ROLE_HIERARCHY);
    }

    const currentLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    return Object.keys(ROLE_HIERARCHY).filter(
      (role) => ROLE_HIERARCHY[role] < currentLevel,
    );
  }, [currentUser]);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminUserService.getAdminUsers();
      const data = response.data;

      if (data.success) {
        const users = data.data.admin_users;
        setAdminUsers(users);

        // Calculate stats
        const activeUsers = users.filter((u) => u.is_active);
        const roleCount = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: users.length,
          active: activeUsers.length,
          byRole: roleCount,
        });
      }
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleCreateAdmin = async (formData) => {
    try {
      setActionLoading(true);
      const response = await AdminUserService.createAdminUser(formData);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "Admin user created successfully",
        });
        setCreateDialogOpen(false);
        fetchAdminUsers();
      }
    } catch (error) {
      console.error("Failed to create admin:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      const response = await AdminUserService.updateAdminRole(userId, newRole);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchAdminUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = (user) => {
    if (user.id === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot deactivate your own account",
        variant: "destructive",
      });
      return;
    }
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await AdminUserService.deactivateAdminUser(
        selectedUser.id,
      );
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "User deactivated successfully",
        });
        setDeactivateDialogOpen(false);
        setSelectedUser(null);
        fetchAdminUsers();
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to deactivate user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-600 mt-1">
            Manage administrator accounts and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Admin
        </Button>
      </div>

      {/* Permission Info Alert */}
      {currentUser && currentUser.role !== "super_admin" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can only manage users with lower hierarchy level than your role
            ({currentUser.role}).
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {currentUser?.role?.replace("_", " ")}
            </div>
            <p className="text-xs text-muted-foreground">
              Hierarchy Level: {ROLE_HIERARCHY[currentUser?.role] || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roles Distribution
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.byRole)
                .slice(0, 3)
                .map(([role, count]) => (
                  <div key={role} className="text-xs flex justify-between">
                    <span className="capitalize">{role.replace("_", " ")}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading admin users...</p>
            </div>
          ) : (
            <AdminUserTable
              users={adminUsers}
              currentUserRole={currentUser?.role}
              onEditRole={handleEditRole}
              onDeactivate={handleDeactivate}
              canManage={canManageRole}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateAdminDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateAdmin}
        availableRoles={getAvailableRoles()}
        loading={actionLoading}
      />

      <EditRoleDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateRole}
        user={selectedUser}
        availableRoles={getAvailableRoles()}
        loading={actionLoading}
      />

      <ConfirmationDialog
        isOpen={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Admin User"
        description={`Are you sure you want to deactivate ${selectedUser?.name}? They will no longer be able to access the admin panel.`}
      />
    </div>
  );
};

export default withAdminAuth(AdminManagementPage, {
  module: "admin_management",
  action: "view",
});
