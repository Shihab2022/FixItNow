import { toastTypes } from "@/app/constant";
import { ToastTypes } from "@/types";
import toast from "react-hot-toast";

export function showToast(type: ToastTypes, message: string | object) {
  let parsedMessage = "";
  if (typeof message === "string") {
    parsedMessage = message;
  } else {
    parsedMessage = JSON.stringify(message);
  }
  const notify = () => {
    switch (type) {
      case toastTypes.SUCCESS:
        toast.success(parsedMessage, { position: "top-right" });
        break;
      case toastTypes.FAILED:
        toast.error(parsedMessage, { position: "top-right" });
        break;
      case toastTypes.WARNING:
        toast.error(parsedMessage, { position: "top-right" });
        break;
      case toastTypes.INFO:
        toast.success(parsedMessage, { position: "top-right" });
        break;

      default:
        toast.success(parsedMessage, { position: "top-right" });
    }
  };

  return notify();
}
