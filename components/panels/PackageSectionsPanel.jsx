import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export const PackageSectionsPanel = ({
  package: pkg,
  sections = [],
  selectedSection,
  onSelect,
  onAction,
  isLoading,
}) => {
  if (!pkg) {
    return (
      <div className="text-center p-4 text-sm text-gray-500">
        Select a package to view sections
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg items-center">
        <div>
          <h3 className="font-medium">{pkg.name}</h3>
          <p className="text-sm text-gray-500">Sections</p>
        </div>
        <Button
          className="mt-2 w-full"
          variant="outline"
          size="sm"
          onClick={() =>
            onAction("packageSection", "add", { packageId: pkg.package_id })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.section_id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              selectedSection?.section_id === section.section_id
                ? "bg-gray-100"
                : "bg-white"
            }`}
            title={section.name}
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelect(section)}
            >
              <p className="font-medium truncate text-xs">{section.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {section.description}
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
                  onClick={() => onAction("packageSection", "edit", section)}
                >
                  Edit Section
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("packageSection", "delete", section)}
                  className="text-red-600"
                >
                  Delete Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};
