type BtnTogglerProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function BtnToggler({ open, setOpen }: BtnTogglerProps
) {
  return (
    <button
      type="button"
      onClick={() => setOpen(prev => !prev)}
      aria-expanded={open}
      className="md:hidden p-2 rounded-md text-gray-500 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* "bg-orange-400 text-gray-900 hover:text-white px-4 py-2 rounded-md hover:bg-orange-500*/}
      <span className="sr-only">Open menu</span>
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 6h16M4 12h16M4 18h16"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </button>
  );
}
