function AlertModal({ message, onClose }) {     //alertmodal component to reuse globally
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/60 border border-teal-500 text-teal-300 p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md font-semibold"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default AlertModal;
