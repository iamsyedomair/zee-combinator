export function Input({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
