import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal } from "lucide-react";

// Package listing component
export const PackagesPanel = ({
  selectedType,
  packages = [],
  selectedPackage,
  onSelect,
  onAction,
  isLoading,
}) => {
  if (!selectedType) {
    return (
      <div className="text-center p-4 text-sm text-gray-500">
        Select a service type to view packages
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg items-center">
        <h3 className="font-medium">Packages</h3>
        <Button
          className="w-full mt-2"
          variant="outline"
          size="sm"
          onClick={() =>
            onAction("package", "add", { typeId: selectedType.type_id })
          }
        >
          <Plus className="h-2 w-2" />
          Add Package
        </Button>
      </div>

      <div className="space-y-2">
        {packages.map((pkg) => (
          <div
            key={pkg.package_id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              selectedPackage?.package_id === pkg.package_id
                ? "bg-gray-100"
                : "bg-white"
            }`}
            title={pkg.name}
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelect(pkg)}
            >
              <p className="font-medium truncate text-xs">{pkg.name}</p>
              <p className="text-xs text-gray-500">
                Duration: {pkg.duration_hours}h {pkg.duration_minutes}m
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onAction("package", "edit", pkg)}
                >
                  Edit Package
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("package", "delete", pkg)}
                  className="text-red-600"
                >
                  Delete Package
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};
