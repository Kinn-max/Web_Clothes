

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationState {
  isVisible: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

export const useNotification = () => {
  const notificationState = useState<NotificationState>("notification_state", () => ({
    isVisible: false,
    type: "info",
    title: "",
    message: "",
  }));

  const showNotification = (
    title: string,
    message: string,
    type: NotificationType = "info"
  ) => {
    notificationState.value = {
      isVisible: true,
      type,
      title,
      message,
    };
  };

  const hideNotification = () => {
    notificationState.value.isVisible = false;
  };

  return {
    notificationState,
    showNotification,
    hideNotification,
  };
};
