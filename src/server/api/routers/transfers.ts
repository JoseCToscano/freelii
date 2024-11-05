import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TransferService } from "~/server/services/TransferService";
import { Currency, CurrencyType, TransferStatus } from "@prisma/client";

const IBankDetailsMexico = z.object({
  country: z.literal("Mexico"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientCLABE: z.string(),
  bankTransferId: z.string(), // Added to all schemas
});

const IBankDetailsUSA = z.object({
  country: z.literal("USA"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientBankAddress: z.string(),
  recipientAccountNumber: z.string(),
  recipientRoutingNumber: z.string(),
  bankTransferId: z.string(),
});

const IBankDetailsUK = z.object({
  country: z.literal("UK"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientAccountNumber: z.string(),
  recipientSortCode: z.string(),
  bankTransferId: z.string(),
});

const IBankDetailsPhilippines = z.object({
  country: z.literal("Philippines"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientAccountNumber: z.string(),
  recipientSWIFTBIC: z.string(),
  bankTransferId: z.string(),
});

const IBankDetailsEU = z.object({
  country: z.literal("EU"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientIBAN: z.string(),
  recipientSWIFTBIC: z.string(),
  bankTransferId: z.string(),
});

const IBankDetailsCanada = z.object({
  country: z.literal("Canada"),
  recipientAddress: z.string(),
  recipientBankName: z.string(),
  recipientAccountNumber: z.string(),
  recipientTransitNumber: z.string(),
  recipientInstitutionNumber: z.string(),
  bankTransferId: z.string(),
});

// Union of all bank detail schemas
const IBankDetails = z.union([
  IBankDetailsMexico,
  IBankDetailsUSA,
  IBankDetailsUK,
  IBankDetailsPhilippines,
  IBankDetailsEU,
  IBankDetailsCanada,
]);

export const transfersRouter = createTRPCRouter({
  getTransfer: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transferService = new TransferService(ctx.db);
      return transferService.getTransfer(input.id);
    }),
  createTransfer: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        recipientPhone: z.string(),
        recipientName: z.string(),
        currency: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const transferService = new TransferService(ctx.db);
      return transferService.createTransfer({
        amount: input.amount,
        recipientPhone: input.recipientPhone,
        recipientName: input.recipientName,
        currency: input.currency as Currency,
        currencyType: CurrencyType.FIAT,
        status: TransferStatus.PENDING,
      });
    }),
  fillBankDetails: publicProcedure
    .input(IBankDetails) // Use IBankDetails directly as the schema, not z.infer
    .mutation(async ({ ctx, input }) => {
      const transferService = new TransferService(ctx.db);
      const { bankTransferId, ...bankDetails } = input;
      console.log("Here :)");
      return transferService.fillBankDetails(bankTransferId, bankDetails);
    }),
});
