import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extracting parameters from the query string
    const sender = searchParams.get("from");
    const amount = searchParams.get("amount");
    const hasMessage = searchParams.has("message");
    const message = hasMessage
      ? searchParams.get("message")?.slice(0, 100)
      : "Payment received";

    const senderMessage = sender ? `From ${sender}` : "";

    return new ImageResponse(
      (
        <div
          style={{
            backgroundImage: "linear-gradient(135deg, #1c1c1c, #000, #2c2c2c)", // Add a gradient to create a metallic effect

            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
        >
          {/* Amount with Gradient Text */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: 250,
                letterSpacing: "-0.05em",
                textShadow: "0 0 5px #fff, 0 0 10px #fff", // Add shadow to enhance boldness
                lineHeight: 1,
                color: "transparent",
                backgroundImage: "linear-gradient(to right, #0aa8e9, #dee3ec)",
                backgroundClip: "text",
              }}
            >
              <b
                style={{
                  fontSize: 200,
                  marginTop: 30,
                  fontWeight: "bold",
                  letterSpacing: "-0.05em",
                  textShadow: "0 0 5px #fff, 0 0 10px #fff", // Add shadow to enhance boldness
                  lineHeight: 1,
                  color: "transparent",
                  backgroundImage:
                    "linear-gradient(to right, #138dbb, #0aa8e9)",
                  backgroundClip: "text",
                }}
              >
                $
              </b>
              {Number(amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Message Text */}
          <div
            style={{
              fontSize: 50,
              fontWeight: "bold",
              letterSpacing: "-0.05em",
              color: "#afacac",
              fontStyle: "italic",
              marginTop: 10,
              padding: "0 100px",
            }}
          >
            {message}
          </div>

          {/* Sender Text */}
          <div
            style={{
              fontSize: 30,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "#afacac",
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {senderMessage}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (_e) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
