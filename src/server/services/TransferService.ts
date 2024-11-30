import {
  type Currency,
  type CurrencyType,
  type PrismaClient,
  type TransferStatus,
} from "@prisma/client";
import { BaseService } from "~/server/services/BaseService";

interface INewTransfer {
  amount: number;
  recipientPhone: string;
  recipientName: string;
  currency: Currency;
  currencyType: CurrencyType;
  status: TransferStatus;
}

interface IBankDetailsMexico {
  country: "Mexico";
  recipientAddress: string;
  recipientBankName: string;
  recipientCLABE: string;
}

interface IBankDetailsUSA {
  country: "USA";
  recipientAddress: string;
  recipientBankName: string;
  recipientBankAddress: string;
  recipientAccountNumber: string;
  recipientRoutingNumber: string;
}

interface IBankDetailsUK {
  country: "UK";
  recipientAddress: string;
  recipientBankName: string;
  recipientAccountNumber: string;
  recipientSortCode: string;
}

interface IBankDetailsPhilippines {
  country: "Philippines";
  recipientAddress: string;
  recipientBankName: string;
  recipientAccountNumber: string;
  recipientSWIFTBIC: string;
}

interface IBankDetailsEU {
  country: "EU";
  recipientAddress: string;
  recipientBankName: string;
  recipientIBAN: string;
  recipientSWIFTBIC: string;
}

interface IBankDetailsCanada {
  country: "Canada";
  recipientAddress: string;
  recipientBankName: string;
  recipientAccountNumber: string;
  recipientTransitNumber: string;
  recipientInstitutionNumber: string;
}

type IBankDetails =
  | IBankDetailsMexico
  | IBankDetailsUSA
  | IBankDetailsUK
  | IBankDetailsPhilippines
  | IBankDetailsEU
  | IBankDetailsCanada;

export class TransferService extends BaseService {
  async getTransfer(id: string) {
    return this.db.transfer.findUnique({
      where: {
        id,
      },
      include: {
        sender: true,
      },
    });
  }

  async createTransfer(dto: INewTransfer) {
    console.log("dto", dto);
    return this.db.transfer.create({
      data: {
        amount: dto.amount,
        currency: dto.currency,
        currencyType: dto.currencyType as CurrencyType,
        recipientPhone: dto.recipientPhone,
        recipientName: dto.recipientName,
        status: dto.status,
      },
    });
  }

  async fillBankDetails(bankTransferId: string, dto: IBankDetails) {
    console.log("dto", dto);
    const { country, ...bankDetails } = dto;
    switch (country) {
      case "Mexico": {
        if (!(bankDetails as IBankDetailsMexico).recipientCLABE) {
          throw new Error("CLABE is required");
        }
        if ((bankDetails as IBankDetailsMexico).recipientCLABE.length !== 18) {
          throw new Error("CLABE must be 18 characters long");
        }
        break;
      }
      case "USA": {
        if (!(bankDetails as IBankDetailsUSA).recipientAccountNumber) {
          throw new Error("Account number is required");
        }
        if (!(bankDetails as IBankDetailsUSA).recipientRoutingNumber) {
          throw new Error("Routing number is required");
        }
        break;
      }
      case "UK": {
        if (!(bankDetails as IBankDetailsUK).recipientAccountNumber) {
          throw new Error("Account number is required");
        }
        if (!(bankDetails as IBankDetailsUK).recipientSortCode) {
          throw new Error("Sort code is required");
        }
        break;
      }
      case "Philippines": {
        if (!(bankDetails as IBankDetailsPhilippines).recipientAccountNumber) {
          throw new Error("Account number is required");
        }
        if (!(bankDetails as IBankDetailsPhilippines).recipientSWIFTBIC) {
          throw new Error("SWIFT/BIC is required");
        }
        break;
      }
      case "EU": {
        if (!(bankDetails as IBankDetailsEU).recipientIBAN) {
          throw new Error("IBAN is required");
        }
        if (!(bankDetails as IBankDetailsEU).recipientSWIFTBIC) {
          throw new Error("SWIFT/BIC is required");
        }
        break;
      }
      case "Canada": {
        if (!(bankDetails as IBankDetailsCanada).recipientAccountNumber) {
          throw new Error("Account number is required");
        }
        if (!(bankDetails as IBankDetailsCanada).recipientTransitNumber) {
          throw new Error("Transit number is required");
        }
        if (!(bankDetails as IBankDetailsCanada).recipientInstitutionNumber) {
          throw new Error("Institution number is required");
        }
        break;
      }
    }
    return this.db.transfer.update({
      where: {
        id: bankTransferId,
      },
      data: {
        ...bankDetails,
      },
    });
  }
}
