type DotSpinnerProps = {
  label?: string;
};

const dots = [
  "bg-gray-4",
  "bg-dark",
  "bg-gray-5",
  "bg-dark-4",
];

const DotSpinner = ({ label = "Loading" }: DotSpinnerProps) => {
  return (
    <div
      className="inline-grid h-14 w-14 animate-spin grid-cols-2 place-items-center gap-2"
      role="status"
      aria-label={label}
    >
      {dots.map((className, index) => (
        <span
          key={className}
          className={`block h-3.5 w-3.5 rounded-full ${className}`}
        />
      ))}
    </div>
  );
};

export default DotSpinner;
