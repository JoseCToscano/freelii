"use client";
export const useQRScanner = () => {
  const scan = () => {
    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.showScanQrPopup({
        text: "Please scan the QR code",
      });

      // Listen for the event when QR code data is received
      if (window.Telegram.WebView) {
        window.Telegram.WebView.onEvent(
          "qrTextReceived",
          (data: { data?: string }) => {
            if (data?.data) {
              window.Telegram.WebApp.openLink(data.data);
            } else {
              alert("No data received from QR scan");
              console.error("No data received from QR scan");
            }
          },
        );
      }
    } else {
      console.error("Telegram WebApp is not available.");
    }
  };

  return { scan };
};
