// app/api/bot/route.js

import { type NextRequest, NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { env } from "~/env";

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { webHook: true });

bot
  .setWebHook(`https://c73ac1ab8a88.ngrok.app/api/bot`)
  .then(() => console.log("Webhook set successfully"))
  .catch((err) => console.error("Error setting webhook:", err));

// 1. Handle Inline Queries
bot.on("inline_query", async (query) => {
  const queryText = query.query.toLowerCase().trim();

  // Parse the query for "send" commands
  if (queryText.startsWith("send")) {
    const amountMatch = /send\s+(\d+)\s*(usd)?/.exec(queryText); // Matches amount
    const recipient = queryText.split("to")[1]?.trim(); // Gets recipient name
    const amount = amountMatch ? amountMatch[1] : null;

    const results: TelegramBot.InlineQueryResult[] = [];

    // If both amount and recipient are available, confirm the transaction
    if (amount && recipient) {
      results.push({
        type: "article",
        id: "1",
        title: `Send ${amount} USD to ${recipient}`,
        input_message_content: {
          message_text: `Please confirm: send ${amount} USD to ${recipient}.`,
        },
        description: `Tap to confirm sending ${amount} USD to ${recipient}`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Confirm",
                callback_data: `confirm_${amount}_${recipient}`,
              },
              { text: "Cancel", callback_data: "cancel" },
            ],
          ],
        },
      });
    } else {
      // Prompt for missing details
      if (!amount) {
        results.push({
          type: "article",
          id: "2",
          title: "Enter Amount",
          input_message_content: {
            message_text:
              'Please specify the amount you want to send (e.g., "send 10 USD to John").',
          },
          description: "Tap to specify amount",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Enter amount", switch_inline_query: "send " }],
            ],
          },
        });
      }
      if (!recipient) {
        results.push({
          type: "article",
          id: "3",
          title: "Enter Recipient",
          input_message_content: {
            message_text: `Please specify the recipient (e.g., "send ${amount} USD to John").`,
          },
          description: "Tap to specify recipient",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Enter recipient",
                  switch_inline_query: `send ${amount} USD to `,
                },
              ],
            ],
          },
        });
      }
    }

    bot
      .answerInlineQuery(query.id, results)
      .catch((err) => console.error("Error responding to inline query:", err));
  }
});

// 2. Handle Callback Queries for Confirmation
// Callback query handling in route.js
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const data = String(callbackQuery.data);

  if (data.startsWith("confirm")) {
    const [_, amount, recipient] = data.split("_");

    // Step 1: Acknowledge the callback
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Processing your confirmation...",
    });

    // Step 2: Send a message with the Web App button
    await bot.sendMessage(
      chatId,
      `Please complete your transaction for ${amount} USD to ${recipient}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Review & Confirm",
                web_app: {
                  url: `https://c73ac1ab8a88.ngrok.app/transfer-preview`,
                },
              },
            ],
          ],
        },
      },
    );
  } else if (data === "cancel") {
    await bot.sendMessage(chatId, "❌ Transaction cancelled.");
  }
});

// 3. Define default exports to avoid errors with Next.js App Router
export async function GET() {
  return NextResponse.json({ status: "Bot is running" });
}

export async function POST(req: NextRequest) {
  const update = (await req.json()) as TelegramBot.Update;

  // Pass updates to the bot
  if (update.inline_query) {
    bot.emit("inline_query", update.inline_query);
  } else if (update.callback_query) {
    bot.emit("callback_query", update.callback_query);
  } else if (update.message) {
    console.log("received:", update.message.text);
    // Directly check if the message text is "/send"
    if (update.message.text === "/send") {
      const chatId = update.message.chat.id;
      // Step 1: Prompt the user to enter the recipient's full name
      await bot.sendMessage(
        chatId,
        "Please enter the recipient's full name as it appears on their official ID.",
      );

      // Step 2: Capture the recipient's name and ask for the country
      bot.once("message", async (nameMsg) => {
        const recipientName = nameMsg.text;

        // Ask for the country
        await bot.sendMessage(
          chatId,
          `Thank you! Now, please enter the recipient's country.`,
        );

        // Step 3: Capture the country and then ask for the amount
        bot.once("message", async (countryMsg) => {
          const recipientCountry = countryMsg.text;

          // Ask for the amount to send
          await bot.sendMessage(
            chatId,
            `Got it! How much would you like to send to ${recipientName} in ${recipientCountry}?`,
          );

          // Step 4: Capture the amount
          bot.once("message", async (amountMsg) => {
            const amount = amountMsg.text;

            // Confirm the transaction details with the user
            await bot.sendMessage(
              chatId,
              `📝 *Transaction Summary*

*Recipient Information*
- *Name*: ${recipientName}
- *Country*: ${recipientCountry}

*Transaction Details*
- *Amount*: ${amount} USD
- *${recipientName}* will receive $500 MXN

*Exchange Rate*: 1 USD = 20 MXN

⬇️ *Action Required*
If everything looks correct, tap *Review & Confirm* to proceed. To cancel, tap *Cancel*.
`,
              {
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Review & Confirm",
                        web_app: {
                          url: `https://c73ac1ab8a88.ngrok.app/transfer-preview`,
                        },
                      },
                      { text: "❌ Cancel", callback_data: "cancel" },
                      { text: "Edit", callback_data: "edit" },
                    ],
                  ],
                },
              },
            );
          });
        });
      });
    } else {
      bot.emit("message", update.message);
    }
  }

  return NextResponse.json({ status: "ok" });
}
