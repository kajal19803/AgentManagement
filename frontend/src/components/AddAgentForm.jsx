function AddAgentForm({
  name, email, mobile, password,
  setName, setEmail, setMobile, setPassword,
  handleAddAgent
}) {
  const code = mobile.includes('-') ? mobile.split('-')[0] : '+91';
  const number = mobile.includes('-') ? mobile.split('-')[1] : '';

  const updateCode = (newCode) => {
    setMobile(`${newCode}-${number}`);
  };

  const updateNumber = (newNumber) => {
    setMobile(`${code}-${newNumber}`);
  };

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-400 dark:border-gray-700 shadow-lg">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Add Agent</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
        />
        <div className="flex gap-2">
          <select
            value={code}
            onChange={(e) => updateCode(e.target.value)}
            className="w-24 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
          >
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
          </select>
          <input
            type="tel"
            placeholder="Mobile"
            value={number}
            onChange={(e) => updateNumber(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
          />
        </div>
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
        />
      </div>
      <button
        onClick={handleAddAgent}
        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium"
      >
        Add Agent
      </button>
    </div>
  );
}

export default AddAgentForm;

