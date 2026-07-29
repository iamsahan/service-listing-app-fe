"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "@hooks/use-toast";
import { Input } from "@components/ui/input";
import { DeleteForeverOutlined } from "@mui/icons-material";
import { providerAPI } from "@api/provider";
import { serviceAPI } from "@/api/services";
import { Camera, Edit, Eye, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@components/ui/button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Image from "next/image";

/* Employee Details Modal */
const EmployeeDetailsModal = ({ employee }) => {
  if (!employee) return null;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Employee Details - {employee.employee_id}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Employee Information</h3>
            <p>Name: {employee.User?.name}</p>
            <p>Email: {employee.User?.email}</p>
            <p>Phone: {employee.User?.mobile}</p>
            <p>NIC: {employee.User?.nic}</p>
            <p>Gender: {employee.User?.gender}</p>
            <p>
              Date of Birth: {new Date(employee.User?.dob).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Job Details</h3>
            <p>Role: {employee.role}</p>
            <p>Qualification: {employee.qualification}</p>
            <p>Experience: {employee.years_experience} years</p>
            <p>Status: {employee.status}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

/*  Employee Form Modal */
const EmployeeFormModal = forwardRef(({ employee, onSubmit, onClose }, ref) => {
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      nic: "",
      gender: "Male",
      dob: "",
      role: "",
      qualification: "",
      years_experience: "",
      status: "active",
      serviceCategories: [],
    },
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await serviceAPI.getCities();
        const cityOptions = response.data.map((city) => ({
          value: city.city_id,
          label: city.name,
        }));
        setCitiesOptions(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.User?.name || "",
        email: employee.User?.email || "",
        mobile: employee.User?.mobile || "",
        nic: employee.User?.nic || "",
        gender: employee.User?.gender || "Male",
        dob: employee.User?.dob || "",
        role: employee.role || "",
        qualification: employee.qualification || "",
        years_experience: employee.years_experience || "",
        status: employee.status || "active",
      });
    } else {
      reset({
        name: "",
        email: "",
        mobile: "",
        nic: "",
        gender: "Male",
        dob: "",
        role: "",
        qualification: "",
        years_experience: "",
        status: "active",
      });
      setSelectedCities([]);
    }
  }, [employee, reset]);

  useImperativeHandle(ref, () => ({
    resetForm: () => {
      reset();
      setSelectedCities([]);
    },
  }));

  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      cities: selectedCities,
    };
    onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {employee ? "Edit Employee" : "Add New Employee"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Name</label>
            <Input {...register("name", { required: "Name is required" })} />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold">Email</label>
            <Input
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold">Phone</label>
            <Input {...register("mobile", { required: "Phone is required" })} />
            {errors.mobile && (
              <p className="text-red-500">{errors.mobile.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold">NIC</label>
            <Input {...register("nic")} />
          </div>
          <div>
            <label className="block font-semibold">Date of Birth</label>
            <Input type="date" {...register("dob")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Role</label>
            <Input {...register("role", { required: "Role is required" })} />
            {errors.role && (
              <p className="text-red-500">{errors.role.message}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold">Qualification</label>
            <Input
              {...register("qualification", {
                required: "Qualification is required",
              })}
            />
          </div>
          <div>
            <label className="block font-semibold">Experience (Years)</label>
            <Input
              type="number"
              {...register("years_experience", { required: "Required" })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" onClick={onClose} className="bg-gray-400">
            Cancel
          </Button>
          <Button type="submit">
            {employee ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
});

EmployeeFormModal.displayName = "EmployeeFormModal";

/* Main Page */
const Page = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isEditFormOpen, setEditFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [provider, setProvider] = useState();
  const formRef = useRef();

  const clearSelected = () => setSelectedEmployee(null);

  const fetchEmployees = async (user) => {
    try {
      const response = await providerAPI.getProviderEmployees(user?.providerId);
      setEmployeeData(response?.data);
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    setProvider(user);
    if (user) fetchEmployees(user);
  }, []);

  const handleEmployeeSubmit = async (data) => {
    try {
      if (selectedEmployee) {
        await providerAPI.updateProviderEmployees(
          selectedEmployee.employee_id,
          data
        );
        toast({
          title: "Success!",
          description: "Employee Successfully Updated!",
        });
      } else {
        await providerAPI.addProviderEmployees(provider?.providerId, data);
        toast({
          title: "Success!",
          description: "New Employee Added Successfully!",
        });
      }
      setEditFormOpen(false);
      clearSelected();
      fetchEmployees(provider);
    } catch (error) {
      toast({
        title: "Error",
        description: selectedEmployee
          ? "Error Updating Employee!"
          : "Error Adding Employee!",
        variant: "destructive",
      });
      console.error("Employee submit error", error);
    }
  };

  const handleEmployeeDelete = async (id) => {
    try {
      await providerAPI.deleteProviderEmployee(id);
      setConfirmationDialogOpen(false);
      clearSelected();
      toast({
        title: "Deleted",
        description: "Employee successfully deleted!",
      });
      fetchEmployees(provider);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const handleEmployeePhotoUpload = async (employeeId, e) => {
    const file = e.target.files[0];
    if (!file || !employeeId || !provider) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await providerAPI.uploadProviderEmployeePhoto(employeeId, formData);
      fetchEmployees(provider);
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      <div className="flex justify-between mb-2">
        <h1 className="text-2xl lg:text-3xl ml-10 font-bold text-gray-800">
          Business Employees
        </h1>
        <button
          type="button"
          onClick={() => {
            setSelectedEmployee(null);
            setEditFormOpen(true);
          }}
          className="bg-[#5f60b9] text-sm lg:text-base mr-10 flex items-center space-x-2 text-white px-3 py-1 rounded-lg hover:bg-[#5f60b9]/80"
        >
          <PlusCircle size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="p-6 mt-10 lg:ml-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeeData.map((employee) => (
          <div
            key={employee.employee_id}
            className="bg-gray-100 border rounded-lg p-4 flex flex-col items-center text-center"
          >
            <div className="relative w-28 h-28">
              <Image
                src={
                  employee?.User?.photo
                    ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}${employee.User.photo}`
                    : "/assets/images/def_pro.webp"
                }
                alt={employee.User?.name || "User"}
                layout="fill"
                className="rounded-full object-cover"
              />

              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    handleEmployeePhotoUpload(employee.employee_id, e);
                  }}
                />
              </label>
            </div>
            <h3 className="mt-3 font-semibold text-lg">
              {employee.User?.name}
            </h3>
            <div className="my-2 text-sm">
              <p className="text-gray-600">{employee.role}</p>
              <p className="text-gray-500">{employee.User?.email}</p>
              <p className="text-gray-500">{employee.User?.mobile}</p>
            </div>
            <div className="flex gap-4 mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(employee);
                  setEditFormOpen(true);
                }}
              >
                <Edit />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(employee);
                  setDialogOpen(true);
                }}
              >
                <Eye />
              </Button>
              <Button
                variant="secondary"
                className="bg-red-500/10 text-destructive"
                onClick={() => {
                  setSelectedEmployee(employee);
                  setConfirmationDialogOpen(true);
                }}
              >
                <DeleteForeverOutlined />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(state) => {
          setDialogOpen(state);
          if (!state) clearSelected();
        }}
      >
        <EmployeeDetailsModal employee={selectedEmployee} />
      </Dialog>

      <Dialog
        open={isEditFormOpen}
        onOpenChange={(state) => {
          setEditFormOpen(state);
          if (!state) {
            clearSelected();
          }
        }}
      >
        <EmployeeFormModal
          ref={formRef}
          employee={selectedEmployee}
          onSubmit={handleEmployeeSubmit}
          onClose={() => {
            setEditFormOpen(false);
            clearSelected();
          }}
        />
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmationDialogOpen}
        onOpenChange={(state) => {
          setConfirmationDialogOpen(state);
          if (!state) clearSelected();
        }}
        onConfirm={() => handleEmployeeDelete(selectedEmployee?.employee_id)}
      />
    </div>
  );
};

export default Page;
