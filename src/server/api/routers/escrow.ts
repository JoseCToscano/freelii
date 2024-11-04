import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { addressToScVal, numberToU64 } from "~/lib/utils";
import { SorobanRPC } from "~/server/services/SorobanInvoquer";
import { createHash } from "crypto";
import {
  xdr,
  Keypair,
  Networks,
  TransactionBuilder,
  scValToNative,
} from "@stellar/stellar-sdk";

const PHONE_MISSMATCH_ERROR = 999999;

/**
 * Hashes a phone number and returns the hashed value as an ScVal BytesN
 * @param {string} phoneNumber - The phone number to hash
 * @returns {xdr.ScVal} - Hashed phone number as a BytesN ScVal
 */
function hashPhoneNumber(phoneNumber: string): xdr.ScVal {
  // Step 1: Convert the phone number to bytes (if it's a string)
  const phoneBuffer = Buffer.from(phoneNumber);

  // Step 2: Hash the bytes using SHA-256
  const hashBuffer = createHash("sha256").update(phoneBuffer).digest();

  // Step 3: Convert the hash (Buffer) to xdr.ScVal.BytesN
  const hashBytesN = xdr.ScVal.scvBytes(hashBuffer);

  return hashBytesN;
}

export const escrowRouter = createTRPCRouter({
  initialize: publicProcedure
    .input(
      z.object({
        funds: z.number(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Encrypt phone number
      const encryptedPhone = hashPhoneNumber(input.phoneNumber);
      console.log("encryptedPhone", encryptedPhone);

      // Interact with the Soroban contract to initialize escrow
      const rpcCall = new SorobanRPC(
        env.ESCROW_CONTRACT_ADDRESS,
        env.FREELII_DISTRIBUTOR_PUBLIC_KEY,
        "initialize",
      );
      console.log("before prepare");
      const xdr = await rpcCall.prepareXDR([
        numberToU64(input.funds),
        encryptedPhone,
      ]);
      console.log("after prepare");

      // Sign and invoke transaction
      const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
      transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));

      // Invoke RPC with signed transaction
      const result = await rpcCall.invoke(transaction.toXDR());
      console.log("result", result, result ? scValToNative(result) : "none");
      return result;
    }),
  generateOTP: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
        phoneNumber: z.string(),
      }),
    )
    // 2. Generate OTP
    .mutation(async ({ ctx, input }) => {
      const encryptedPhone = hashPhoneNumber(input.phoneNumber);

      // Interact with the Soroban contract to initialize escrow
      const rpcCall = new SorobanRPC(
        env.ESCROW_CONTRACT_ADDRESS,
        env.FREELII_DISTRIBUTOR_PUBLIC_KEY,
        "generate_otp",
      );
      const xdr = await rpcCall.prepareXDR([encryptedPhone]);

      // Sign and invoke transaction
      const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
      transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));

      // Invoke RPC with signed transaction
      const result = await rpcCall.invoke(transaction.toXDR());
      const otp = result ? (scValToNative(result) as number) : null;

      if (otp === PHONE_MISSMATCH_ERROR) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "No pending funds for this phone number. If this seems incorrect, please reach out to support.",
        });
      }

      if (!otp || typeof otp !== "number") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification code",
        });
      }

      const otpVerification = await ctx.db.oTPVerification.upsert({
        where: {
          transferId: input.transferId,
        },
        update: {
          otpCode: String(otp),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 25 minutes
          verified: false,
        },
        create: {
          transferId: input.transferId,
          otpCode: String(otp),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 25 minutes
          verified: false,
        },
      });

      return otpVerification.otpCode;
    }),
  verifyOTP: publicProcedure
    .input(
      z.object({
        otp: z.number(),
        transferId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const otpVerification = await ctx.db.oTPVerification.findFirst({
        where: {
          transferId: input.transferId,
          verified: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (!otpVerification) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Expired verification code",
        });
      }

      if (otpVerification.otpCode !== String(input.otp)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification code",
        });
      }

      await ctx.db.oTPVerification.update({
        where: {
          id: otpVerification.id,
        },
        data: {
          verified: true,
        },
      });
      return true;
    }),
  fund: publicProcedure.mutation(async ({ ctx }) => {
    // Interact with the Soroban contract to initialize escrow
    const rpcCall = new SorobanRPC(
      env.ESCROW_CONTRACT_ADDRESS,
      env.FREELII_DISTRIBUTOR_PUBLIC_KEY,
      "fund",
    );

    const xdr = await rpcCall.prepareXDR([
      addressToScVal(env.FREELII_DISTRIBUTOR_PUBLIC_KEY), // Sender
      // TODO: This key should be the Anchor's respective key
      addressToScVal(env.USDC_SAC), // USDC_SAC
    ]);

    // Sign and invoke transaction
    const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
    transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));

    // Invoke RPC with signed transaction
    const result = await rpcCall.invoke(transaction.toXDR());
    const errorCode = result ? (scValToNative(result) as number) : null;
  }),
  redeemFunds: publicProcedure
    .input(
      z.object({
        transferId: z.string(),
      }),
    )

    // 3. Redeem Funds
    .mutation(async ({ ctx, input }) => {
      // Interact with the Soroban contract to initialize escrow
      const rpcCall = new SorobanRPC(
        env.ESCROW_CONTRACT_ADDRESS,
        env.FREELII_DISTRIBUTOR_PUBLIC_KEY,
        "redeem",
      );

      await ctx.db.oTPVerification.findFirstOrThrow({
        where: {
          transferId: input.transferId,
          verified: true,
        },
      });

      const xdr = await rpcCall.prepareXDR([
        // TODO: This key should be the Anchor's respective key
        addressToScVal(
          "GCLQTRLPMITD76LYTZA23E747YO2PEROCUUKT7AJ4V6UDXQAQNOYRERU",
        ),
        addressToScVal(env.USDC_SAC), // USDC_SAC
      ]);

      // Sign and invoke transaction
      const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
      transaction.sign(Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY));

      // Invoke RPC with signed transaction
      const result = await rpcCall.invoke(transaction.toXDR());
      const errorCode = result ? (scValToNative(result) as number) : null;
      console.log("errorCode", errorCode, Number(errorCode));
      if (Number(errorCode) === 999_996) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized to redeem funds",
        });
      }
      if (Number(errorCode) === 999_998) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Code has expired",
        });
      }
      if (Number(errorCode) === 999_995) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid code, please try again",
        });
      }
    }),
});
