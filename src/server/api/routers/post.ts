import { z } from "zod";
import { Twilio } from "twilio";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

async function sendSms(to: string, text: string) {
  const accountSid = "ACd5601360d5a7391df2f933682dcda442";
  const authToken = "2e00a6b7f840ace0025ff4abcbf5cea1"; // Replace with your actual Auth Token
  const client = new Twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      to,
      from: "+12135148760",
      body: text,
    });
    console.log("Message sent:", message.sid);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export const postRouter = createTRPCRouter({
  otp: publicProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ input }) => {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendSms(input.phone, `Your Freeli OTP is: ${otp}`);
      return otp;
    }),
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),
});
