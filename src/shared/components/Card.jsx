export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 transition-all duration-200 ${
        hover
          ? "hover:border-gray-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
