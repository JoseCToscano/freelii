import React, { useState } from "react";

interface PasskeySetupProps {
  // registrationUrl: string; // Backend endpoint URL for Passkey registration
  onComplete?: () => void; // Optional callback when registration completes
}

const PasskeySetup: React.FC<PasskeySetupProps> = ({
  // registrationUrl,
  onComplete,
}) => {
  const [isIframeOpen, setIframeOpen] = useState(false);

  const openIframe = () => {
    setIframeOpen(true);
  };

  const closeIframe = () => {
    setIframeOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div>
      <button onClick={openIframe} className="setup-passkey-button">
        Setup Passkey
      </button>

      {isIframeOpen && (
        <div className="iframe-container">
          <iframe
            src="/wallet/new-passkey"
            title="Passkey Setup"
            className="iframe"
            onLoad={() => console.log("Iframe loaded")}
          ></iframe>
          <button onClick={closeIframe} className="close-button">
            Close
          </button>
        </div>
      )}

      {/* Styling */}
      <style jsx>{`
        .setup-passkey-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .iframe-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .iframe {
          width: 90%;
          height: 80%;
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .close-button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default PasskeySetup;
