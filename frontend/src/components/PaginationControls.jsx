function PaginationControls({ page, total, limit, onPrev, onNext }) {  //pagination component
  return (
    <div className="flex gap-2 items-center justify-end">
      <button disabled={page === 1} onClick={onPrev} className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}>Prev</button>
      <span className="text-sm text-gray-600 dark:text-gray-300">{`Page ${page} of ${Math.ceil(total / limit)}`}</span>
      <button disabled={page >= Math.ceil(total / limit)} onClick={onNext} className={`px-3 py-1 rounded ${page >= Math.ceil(total / limit) ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}>Next</button>
    </div>
  );
}

export default PaginationControls;