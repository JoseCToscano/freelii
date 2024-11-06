export const useHapticFeedback = () => {
  const clickFeedback = (
    type:
      | "light"
      | "medium"
      | "heavy"
      | "rigid"
      | "soft"
      | "success"
      | "warning"
      | "error"
      | "selectionChanged" = "medium",
  ) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      switch (type) {
        case "light":
        case "medium":
        case "heavy":
        case "rigid":
        case "soft":
          window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
          break;
        case "success":
        case "warning":
        case "error":
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
          break;
        case "selectionChanged":
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
          break;
        default:
          console.warn("Invalid haptic feedback type");
      }
    } else {
      console.error("Haptic feedback is not supported");
    }
  };

  return { clickFeedback };
};
