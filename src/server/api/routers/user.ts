import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AuthService } from "~/server/services/AuthService";

export const userRouter = createTRPCRouter({
  registerUser: publicProcedure
    .input(z.object({ telegramId: z.string().or(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.create({
        data: {
          telegramId: String(input.telegramId),
        },
      });
      return user;
    }),
  getUserByTelegramId: publicProcedure
    .input(z.object({ telegramId: z.string().or(z.number()) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { telegramId: String(input.telegramId) },
      });
      return user;
    }),
  setPin: publicProcedure
    .input(z.object({ userId: z.string().or(z.number()), pin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService(ctx.db);
      const { success } = await authService.setPin(
        Number(input.userId),
        input.pin,
      );
      console.log("success:", success);
      if (!success) {
        throw new Error("Failed to set pin");
      }
      return { success: true };
    }),
  validatePin: publicProcedure
    .input(z.object({ userId: z.string().or(z.number()), pin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService(ctx.db);
      const { success } = await authService.validatePin(
        Number(input.userId),
        input.pin,
      );
      console.log("success:", success);
      if (!success) {
        throw new Error("Invalid pin");
      }
      return { success: true };
    }),
});
