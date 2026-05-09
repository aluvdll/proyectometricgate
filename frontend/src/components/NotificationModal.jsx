export const NotificationModal = ({ title, message, type }) => {
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg ${bgColor} max-w-sm`}
      >
        <div className={`shrink-0 w-8 h-8 mr-3 ${iconColor}`}>
          {type === "success" ? (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-gray-700 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
