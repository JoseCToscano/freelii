import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Sep10 } from "~/server/services/stellar/Sep10";
import { Sep31 } from "~/server/services/stellar/Sep31";
import { handleHorizonServerError } from "~/lib/utils";
import { account } from "~/server/services/stellar/PasskeyServer";
import { Sep6 } from "~/server/services/stellar/Sep6";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";
import { Sep12 } from "~/server/services/stellar/Sep12";

export const stellarRouter = createTRPCRouter({
  getAuthChallenge: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sep10 = new Sep10("testanchor.stellar.org");
      // TODO
      console.log(`Generating challenge transaction for ${input.publicKey}`);
      return sep10.getChallengeTransaction(input.publicKey);
    }),
  getTransferData: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
    }),
  signAuthChallenge: publicProcedure
    .input(
      z.object({
        transactionXDR: z.string(),
        networkPassphrase: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sep10 = new Sep10("testanchor.stellar.org");
      // const transaction = TransactionBuilder.fromXDR(
      //   input.transactionXDR,
      //   input.networkPassphrase,
      // );
      // // TODO
      // transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));
      // const xdr = transaction.toXDR();
      const token = await sep10.submitChallengeTransaction(
        input.transactionXDR,
      );
      console.log("token is:", token);
      return token;
    }),

  saveSigner: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        contractId: z.string(),
        signerId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.user.update({
        where: { phone: input.phone },
        data: {
          passkeyCAddress: input.contractId,
          passkeyKey: input.signerId,
        },
      });
    }),
  startAuthSession: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        publicKey: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.authSession.create({
        data: {
          userId: input.userId,
          publicKey: input.publicKey,
        },
      });
    }),
  saveAuthSession: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        token: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.authSession.update({
        where: {
          id: input.sessionId,
        },
        data: {
          token: input.token,
        },
      });
    }),

  send: publicProcedure
    .input(z.object({ xdr: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = (await account.send(input.xdr)) as never;
        return {
          success: true,
          result,
        };
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
  deposit: publicProcedure
    .input(z.object({ transferId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        if (!transfer) {
          throw new TRPCError({
            message: "Transfer not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        if (!transfer.senderAuthSessionId) {
          throw new TRPCError({
            message: "Transfer is not associated with an auth session",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        const authSession = await ctx.db.authSession.findFirst({
          where: { id: transfer.senderAuthSessionId },
        });

        const sep6 = new Sep6("testanchor.stellar.org");
        console.log("Initiating deposit for transfer", transfer);
        console.log("authSession", authSession);
        const deposit = await sep6.initiateDeposit({
          authToken: authSession?.token ?? "",
          formData: {
            destination_asset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            source_asset: "iso4217:USD",
            amount: Number(transfer.amount),
            account: authSession?.publicKey ?? "",
            type: "bank_account",
          },
        });
        console.log("Deposit initiated", deposit);
        await ctx.db.hostedDeposits.create({
          data: {
            amount: transfer.amount,
            transferId: input.transferId,
            userId: Number(authSession?.userId),
            sep6Id: deposit.id,
            destinationAsset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            sourceAsset: "iso4217:USD",
            type: "bank_account",
          },
        });

        return deposit;
      } catch (e) {
        console.error(e);
        // This will throw a TRPCError with the appropriate message
        throw new TRPCError({
          message: "Failed to initiate deposit",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  withdraw: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const transfer = await ctx.db.transfer.findUnique({
          where: { id: input.transferId },
        });
        if (!transfer) {
          throw new TRPCError({
            message: "Transfer not found",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        if (!transfer.senderAuthSessionId) {
          throw new TRPCError({
            message: "Transfer is not associated with an auth session",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        const authSession = await ctx.db.authSession.findUnique({
          where: { id: Number(transfer.receiverAuthSessionId) },
        });

        const sep6 = new Sep6("testanchor.stellar.org");
        const withdraw = await sep6.initiateWithdrawal({
          authToken: authSession?.token ?? "",
          formData: {
            source_asset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            destination_asset: "iso4217:USD",
            amount: Number(transfer.amount),
            account: authSession?.publicKey ?? "",
            type: "bank_account",
            dest: "12345",
            dest_extra: String(transfer.id),
          },
        });

        await ctx.db.hostedWithdrawals.create({
          data: {
            amount: transfer.amount,
            transferId: input.transferId,
            userId: Number(authSession?.userId),
            sep6Id: withdraw.id,
            destinationAsset: "iso4217:USD",
            sourceAsset:
              "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
            type: "bank_account",
            account_number: "12345",
            roting_number: String(transfer.id),
          },
        });

        // TODO save ID and link to transfer object
        return withdraw;
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        throw new TRPCError({
          message: "Failed to initiate deposit",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  kyc: publicProcedure
    .input(
      z.object({
        type: z.string(), // "sender" | "receiver"
        transferId: z.string(),
        fields: z.object({
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          email_address: z.string().optional(),
          // file
          photo_id_front: z.string().optional(),
          photo_id_back: z.string().optional(),
          bank_number: z.string().optional(),
          bank_account_number: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transfer = await ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
      if (!transfer) {
        throw new TRPCError({
          message: "Transfer not found",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      let authSessionId = transfer.senderAuthSessionId;
      if (input.type === "receiver") {
        authSessionId = transfer.receiverAuthSessionId;
      }

      if (!authSessionId) {
        throw new TRPCError({
          message: "Transfer is not associated with an auth session",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      const authSession = await ctx.db.authSession.findUniqueOrThrow({
        where: { id: authSessionId },
      });

      const kycEntry = await ctx.db.kYC.findFirst({
        where: {
          authSessionId: authSessionId,
          userId: authSession.userId,
        },
      });

      if (kycEntry?.sep12Id) {
        Object.assign(input.fields, {
          id: kycEntry.sep12Id,
        });
      }

      const sep12 = new Sep12("testanchor.stellar.org");
      const { id } = await sep12.putSep12Fields({
        authToken: String(authSession.token),
        fields: input.fields,
      });

      if (!kycEntry?.sep12Id) {
        await ctx.db.kYC.create({
          data: {
            userId: authSession.userId,
            authSessionId: authSession.id,
            sep12Id: id,
            status: "submitted",
          },
        });
      }

      return id;
    }),
  kycFileConfig: publicProcedure
    .input(
      z.object({
        type: z.string(), // "sender" | "receiver"
        transferId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transfer = await ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
      if (!transfer) {
        throw new TRPCError({
          message: "Transfer not found",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      let authSessionId = transfer.senderAuthSessionId;
      if (input.type === "receiver") {
        authSessionId = transfer.receiverAuthSessionId;
      }

      if (!authSessionId) {
        throw new TRPCError({
          message: "Transfer is not associated with an auth session",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      const authSession = await ctx.db.authSession.findUniqueOrThrow({
        where: { id: authSessionId },
      });

      const kycEntry = await ctx.db.kYC.findFirst({
        where: {
          authSessionId: authSessionId,
          userId: authSession.userId,
        },
      });

      if (!kycEntry?.sep12Id) {
        throw new TRPCError({
          message: "KYC not submitted",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const sep12 = new Sep12("testanchor.stellar.org");
      const { url, config } = await sep12.getKYCRequestConfigForFiles({
        authToken: String(authSession.token),
      });

      return { url, config };
    }),
  linkSenderAuthSession: publicProcedure
    .input(
      z.object({
        authSessionId: z.number(),
        transferId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transfer = await ctx.db.transfer.findUnique({
        where: { id: input.transferId },
      });
      if (!transfer) {
        throw new TRPCError({
          message: "Transfer not found",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      const authSession = await ctx.db.authSession.findUniqueOrThrow({
        where: { id: input.authSessionId },
      });

      await ctx.db.transfer.update({
        where: { id: input.transferId },
        data: {
          senderAuthSessionId: authSession.id,
        },
      });
    }),
});
