interface ModalAlertProps {
  title: string;
  message: string;
  type?: "success" | "error"; // success = verde, error = rojo
  onAccept?: () => void;
  onCancel?: () => void;
}

export const ModalAlert: React.FC<ModalAlertProps> = ({
  title,
  message,
  type = "success",
  onAccept,
  onCancel,
}) => {
  // Definimos colores según tipo
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";
  const btnColor = type === "success" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500";

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* <div className="fixed inset-0 transition-opacity"> */}
            {/*Fondo completo trasparete    */}
          {/* <div className="absolute inset-0 opacity-75  bg-gray-200"></div> */}
        {/* </div> */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
              <svg className={`h-6 w-6 ${iconColor}`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={type === "success" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm leading-5 text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse bg-amber-50">
            <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
              <button
                type="button"
                className={`inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 ${btnColor} text-base leading-6 font-medium text-white shadow-sm focus:outline-none focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5`}
                onClick={onAccept}
              >
                Accept
              </button>
            </span>
            <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                onClick={onCancel}
              >
                Cancel
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
