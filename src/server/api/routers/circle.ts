import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CircleService } from "~/server/services/circle/CircleService";

export const circleRouter = createTRPCRouter({
  getSession: publicProcedure
    .input(z.object({ quoteId: z.string(), transferId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const circleService = new CircleService(ctx.db);
      console.log("quoteId", input.quoteId);
      const session = await circleService.getSessionForQuoute(
        input.quoteId,
        input.transferId,
      );
      console.log("session:", session);
      return session;
    }),
});
