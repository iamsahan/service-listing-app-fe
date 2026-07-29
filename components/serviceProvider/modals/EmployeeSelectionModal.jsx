import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EmployeeSelectionModal = ({
  open,
  onClose,
  employees = [],
  selectedEmployee,
  onSelect,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {employees.length > 0 ? (
            <RadioGroup value={selectedEmployee} onValueChange={onSelect}>
              {employees.map((employee) => (
                <div
                  key={employee.employee_id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={employee.employee_id}
                    id={employee.employee_id}
                  />
                  <Label htmlFor={employee.employee_id}>
                    {employee.User?.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-gray-500">No active employees available.</p>
          )}
        </div>

        <Button
          onClick={onConfirm}
          disabled={!selectedEmployee || employees.length === 0}
        >
          Confirm Assignment
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(EmployeeSelectionModal);
