function EmptyCartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className="h-16 w-16 text-white"
      aria-hidden="true"
    >
      <path
        d="M6 8h6l8 28h28l6-20H18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="26" cy="52" r="3" stroke="currentColor" strokeWidth="3" />
      <circle cx="46" cy="52" r="3" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
export default EmptyCartIcon;
