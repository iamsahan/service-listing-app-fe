import Modal from "react-modal";

export default function LogoutDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Modal
      isOpen={open}
      onRequestClose={onOpenChange}
      ariaHideApp={false}
      className="m-10 bg-white p-6 rounded-lg shadow-xl w-96 max-w-lg"
      overlayClassName="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
    >
      <div className="space-y-4">
        <p className="text-lg font-semibold">
          Are you sure you want to Logout?
        </p>
        <div className="flex space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
            onClick={onConfirm}
          >
            Yes, Logout
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded-lg w-full"
            onClick={onOpenChange}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
