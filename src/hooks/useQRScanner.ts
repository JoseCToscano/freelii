"use client";
export const useQRScanner = () => {
  const scan = () => {
    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.showScanQrPopup({
        text: "Please scan the QR code",
      });

      // Listen for the event when QR code data is received
      window.Telegram.WebApp.onEvent(
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

      // Listen for when the QR scanner popup is closed
      window.Telegram.WebApp.onEvent("scanQrPopupClosed", () => {
        console.log("QR code scan popup closed");
      });
    } else {
      console.error("Telegram WebApp is not available.");
    }
  };

  return { scan };
};
