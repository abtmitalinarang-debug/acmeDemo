import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
  default: (message: string, description?: string) => {
    sonnerToast(message, { description });
  },
};

export const Toaster = SonnerToaster;
