import CustomerBookings from "@/components/booking/CustomerBookings";

export default function Page() {
  return (
    <>
      <span className="text-2xl font-semibold block mb-5 sm:hidden">
        My Bookings
      </span>
      <CustomerBookings baseUrl="/profile/customer/bookings" />
    </>
  );
}
