import { soundManager } from "../../core/audio/SoundManager";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variants = {
    primary:
      "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105",
    secondary:
      "bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg",
    ghost:
      "bg-transparent hover:bg-white/10 text-white border border-gray-600 hover:border-gray-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={(e) => {
        soundManager.playClick();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
