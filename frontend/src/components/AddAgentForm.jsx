function AddAgentForm({
  name, email, mobile, password,
  setName, setEmail, setMobile, setPassword,
  handleAddAgent,
  errors = {},
  setErrors = () => {}
}) {
  // Extract country code and number from mobile string
  const code = mobile.includes('-') ? mobile.split('-')[0] : '+91';
  const number = mobile.includes('-') ? mobile.split('-')[1] : '';

  // Update country code in mobile
  const updateCode = (newCode) => {
    setMobile(`${newCode}-${number}`);
  };

  // Update number part in mobile
  const updateNumber = (newNumber) => {
    setMobile(`${code}-${newNumber}`);
  };

  // Determine input border color based on error or valid state
  const getBorderColor = (field, value) => {
    if (errors[field]) return 'border-red-500';
    if (value) return 'border-green-500';
    return 'border-gray-400 dark:border-gray-600';
  };

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-400 dark:border-gray-700 shadow-lg">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Add Agent</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name Field */}
        <div>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            className={`p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border ${getBorderColor('name', name)}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            className={`p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border ${getBorderColor('email', email)}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Country Code + Mobile Number */}
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
          <div className="flex-1">
            <input
              type="tel"
              placeholder="Mobile"
              value={number}
              onChange={(e) => {
                updateNumber(e.target.value);
                if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
              }}
              className={`w-full p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border ${getBorderColor('mobile', number)}`}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            className={`p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border ${getBorderColor('password', password)}`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
      </div>

      {/* Add Agent Button */}
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


