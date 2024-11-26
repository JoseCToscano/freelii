import { z } from "zod";
import { Twilio } from "twilio";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

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
    .mutation(async ({ input, ctx }) => {
      const otp = "000000";
      if (env.NODE_ENV === "production") {
        // otp = String(Math.floor(100000 + Math.random() * 900000));
      }
      let user = await ctx.db.user.findUnique({
        where: {
          phone: input.phone,
        },
      });
      if (!user) {
        user = await ctx.db.user.create({
          data: {
            phone: input.phone,
          },
        });
      }
      // TODO: Enable this
      if (String(env.ENABLE_SMS) === "true") {
        await sendSms(input.phone, `Your Freelii OTP is: ${otp}`);
      }
      await ctx.db.oTPVerification.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          otpCode: otp,
          verified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        update: {
          otpCode: otp,
          verified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });
    }),
  verifyOtp: publicProcedure
    .input(z.object({ phone: z.string(), otp: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log("input", input.phone);
      const verification = await ctx.db.oTPVerification.findFirst({
        where: {
          user: {
            phone: input.phone,
          },
          otpCode: input.otp,
          verified: false,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          user: true,
        },
      });
      if (!verification) {
        throw new Error("Invalid or expired verification code");
      }
      await ctx.db.oTPVerification.update({
        where: {
          id: verification.id,
        },
        data: {
          verified: true,
        },
      });
      return verification.user;
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
      // return ctx.db.post.create({
      //   data: {
      //     name: input.name,
      //   },
      // });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    return null;
    // const post = await ctx.db.post.findFirst({
    //   orderBy: { createdAt: "desc" },
    // });
    //
    // return post ?? null;
  }),
});
