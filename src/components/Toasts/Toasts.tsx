import { toast } from "react-toastify";

// Define type for notifications
type ToastType = "success" | "error" | "warning" | "default";

export const notify = (message: string, type: ToastType = "default") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warn(message);
      break;
    case "default":
    default:
      toast(message);
      break;
  }
};

export { ToastContainer } from "react-toastify";
