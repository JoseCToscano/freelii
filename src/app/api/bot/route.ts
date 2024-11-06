// app/api/bot/route.js

import { type NextRequest, NextResponse } from "next/server";
import TelegramBot, { InlineQuery } from "node-telegram-bot-api";
import { env } from "~/env";
import {
  countries,
  countryCurrencyMap,
  getRate,
  mapCountry,
} from "~/lib/utils";
import { db } from "~/server/db";
import { TransferStatus } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { webHook: true });

bot
  .setWebHook(`${env.NEXT_PUBLIC_APP_URL}/api/bot`)
  .then(() => console.log("Webhook set successfully"))
  .catch((err) => console.error("Error setting webhook:", err));

// Handle Callback Queries for Confirmation
// Callback query handling in route.js
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const data = String(callbackQuery.data);

  if (data.startsWith("redeem_")) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Loading transaction details...",
    });

    const transfer = await db.transfer.findFirst({
      where: { id: data.split("_")[1] },
      include: { sender: true },
    });
    if (!transfer) {
      await bot.sendMessage(
        chatId,
        "The transaction details could not be found.",
      );
      return NextResponse.json({ status: "ok" });
    }

    await bot.sendMessage(
      chatId,
      `Please confirm the redemption of $${Number(
        transfer.amount,
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} from ${transfer.sender?.firstName ?? transfer.sender?.telegramUsername ?? transfer.sender?.phone ?? "Unknown"} sent ${dayjs(transfer.createdAt).fromNow()}.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Get my money 💸",
                web_app: {
                  url: `${env.NEXT_PUBLIC_APP_URL}/welcome/${transfer.id}?receiver=true`,
                },
              },
              { text: "Cancel", callback_data: "cancel" },
            ],
          ],
        },
      },
    );
  } else if (data.startsWith("confirm")) {
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
                  url: `${env.NEXT_PUBLIC_APP_URL}/transfer-preview`,
                },
              },
            ],
          ],
        },
      },
    );
  } else if (data === "cancel") {
    await bot.sendMessage(chatId, "❌ Operation cancelled.");
  }
});

// 3. Define default exports to avoid errors with Next.js App Router
export async function GET() {
  return NextResponse.json({ status: "Bot is running" });
}

export async function POST(req: NextRequest) {
  const update = (await req.json()) as TelegramBot.Update;
  console.log("Received update:", update);
  if (update.message?.contact) {
    await db.user.upsert({
      where: { phone: update.message.contact.phone_number },
      create: {
        telegramId: String(update.message.contact.user_id),
        phone: update.message.contact.phone_number,
      },
      update: {
        telegramId: String(update.message.chat.id),
      },
    });
    console.log("Received contact:", update.message.contact);
    await bot.sendMessage(
      update.message.chat.id,
      "Thank you! We've registered your phone number. You can now send and receive money. All within Telegram!",
    );
  }
  // Pass updates to the bot
  if (update.inline_query) {
    // @ts-expect-error - Ignore TypeScript error for inline_query event
    bot.emit("inline_query", update.inline_query);
  } else if (update.callback_query) {
    // @ts-expect-error - Ignore TypeScript error for inline_query event
    bot.emit("callback_query", update.callback_query);
  } else if (update.message) {
    console.log("received:", update.message.text);
    if (update.message.text === "/start") {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      if (userId) {
        const user = await db.user.findFirst({
          where: { telegramId: String(userId) },
        });
        if (!user?.phone) {
          await bot.sendMessage(
            chatId,
            "Let's get you started. Please share your phone number with us. We'll use it to search for pending transactions associated with your account.",
            {
              reply_markup: {
                keyboard: [
                  [
                    {
                      text: "Share your phone number",
                      request_contact: true, // Requests the phone number
                    },
                  ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            },
          );
          return NextResponse.json({ status: "ok" });
        }
      }
    } else if (update.message.text === "/redeem") {
      const chatId = update.message.chat.id;
      const userId = update.message.from?.id;
      if (userId) {
        const user = await db.user.findFirst({
          where: { telegramId: String(userId) },
        });
        if (!user?.phone) {
          await bot.sendMessage(
            chatId,
            "Let's get you started. Please share your phone number with us. We'll use it to search for pending transactions associated with your account.",
            {
              reply_markup: {
                keyboard: [
                  [
                    {
                      text: "Share your phone number",
                      request_contact: true, // Requests the phone number
                    },
                  ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            },
          );
          return NextResponse.json({ status: "ok" });
        }

        // Step 1: Prompt the user to enter the collection code
        const transfers = await db.transfer.findMany({
          where: { recipientPhone: user.phone, status: TransferStatus.PENDING },
          orderBy: { createdAt: "asc" },
          take: 5,
          include: { sender: true },
        });
        console.log("transfers:", transfers);
        if (!transfers.length) {
          await bot.sendMessage(
            chatId,
            "There are no pending transactions associated with your account.",
          );
          return NextResponse.json({ status: "ok" });
        }

        await bot.sendMessage(
          chatId,
          "You have pending transactions associated with your account. Please select one to redeem.",
          {
            reply_markup: {
              inline_keyboard: transfers.map((transfer) => [
                {
                  text: `Redeem $${Number(transfer.amount).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )} from ${transfer.sender?.firstName ?? transfer.sender?.telegramUsername ?? transfer.sender?.phone ?? "Unknown"} sent ${dayjs(transfer.createdAt).fromNow()}`,
                  callback_data: `redeem_${transfer.id}`,
                },
              ]),
            },
          },
        );
      }
    } // Directly check if the message text is "/send"
    else if (update.message.text === "/send") {
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
          `Thank you! Please tell us the country where ${recipientName} will receive the funds.`,
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
            const selectedCountry = countries.find(
              (c) => c.value === mapCountry(recipientCountry),
            );
            const rateTo =
              countryCurrencyMap[
                selectedCountry?.value as keyof typeof countryCurrencyMap
              ] ?? "MXN";
            const rate = await getRate("USD", rateTo);
            // Confirm the transaction details with the user
            await bot.sendMessage(
              chatId,
              `📝 *Transaction Summary*

*Recipient Information*
- *Name*: ${recipientName}
- *Country*: ${selectedCountry?.label ?? recipientCountry}

*Transaction Details*
- *Amount*: ${amount} USD
- *${recipientName}* will receive $${(
                Number(rate) * Number(amount)
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${rateTo}

*Exchange Rate*: $1.00 USD = ${rate} ${rateTo}

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
                          url: `${env.NEXT_PUBLIC_APP_URL}/transfer-preview?recipient=${recipientName}&country=${recipientCountry?.toLowerCase()}&amount=${amount}`,
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
      // @ts-expect-error - Ignore TypeScript error for message event
      bot.emit("message", update.message);
    }
  }

  return NextResponse.json({ status: "ok" });
}
