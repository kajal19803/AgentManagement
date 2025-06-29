function UploadFile({ file, setFile, handleUpload }) {
  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-400 dark:border-gray-700 shadow-lg">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Upload CSV/XLSX</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4 text-gray-700 dark:text-gray-300" />
      <button onClick={handleUpload} className="bg-teal-500 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium">Upload & Distribute</button>
    </div>
  );
}

export default UploadFile;