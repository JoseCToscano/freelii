import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import {
  type AnyClientTypes,
  TRPCError,
} from "@trpc/server/unstable-core-do-not-import";

import {
  Horizon,
  nativeToScVal,
  Address,
  SorobanRpc,
  Contract,
  TransactionBuilder,
  Networks,
  xdr,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import axios, { AxiosError } from "axios";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the URL for the Stellar Horizon server based on the network
 * @param network
 */
export function getHorizonServerUrl(network: string): string {
  return network === "Testnet"
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";
}

export function shortStellarAddress(
  longAddress?: string | null,
  charsToShow = 4,
): string {
  if (!longAddress) return "";
  return (
    longAddress.slice(0, charsToShow) + "..." + longAddress.slice(-charsToShow)
  );
}

export function copyToClipboard(text: string, silence = false) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch(() => {
      if (!silence) {
        toast.error("Failed to copy to clipboard");
      }
    });
}

export function generateQrCode(data: string): string {
  const size = "200x200";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
}

export function ClientTRPCErrorHandler<T extends AnyClientTypes>(
  x?: TRPCClientErrorLike<T>,
) {
  if (x?.message) {
    toast.error(x?.message);
  } else if ((x?.data as { code: string })?.code === "INTERNAL_SERVER_ERROR") {
    toast.error("We are facing some issues. Please try again later");
  } else if ((x?.data as { code: string })?.code === "BAD_REQUEST") {
    toast.error("Invalid request. Please try again later");
  } else if ((x?.data as { code: string })?.code === "UNAUTHORIZED") {
    toast.error("Unauthorized request. Please try again later");
  } else if (x?.message) {
    toast.error(x?.message);
  } else {
    toast.error("We are facing some issues! Please try again later");
  }
}

export function handleHorizonServerError(error: unknown) {
  console.log("hi:)");
  let message = "Failed to send transaction to blockchain";
  const axiosError = error as AxiosError<Horizon.HorizonApi.ErrorResponseData>;
  if (
    typeof (axiosError?.response as { detail?: string })?.detail === "string"
  ) {
    message = (axiosError?.response as { detail?: string })?.detail ?? message;
  } else if (axiosError?.response?.data) {
    switch (axiosError.response.data.title) {
      case "Rate Limit Exceeded":
        message = "Rate limit exceeded. Please try again in a few seconds";
        break;
      case "Internal Server Error":
        message = "We are facing some issues. Please try again later";
        break;
      case "Transaction Failed":
        message = "Transaction failed";
        const txError = parsedTransactionFailedError(axiosError.response.data);
        if (txError) {
          message = `Transaction failed: ${txError}`;
        }
        break;
      default:
        message = "Failed to send transaction to blockchain";
        break;
    }
  }
  console.log(message);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
  });
}
function parsedTransactionFailedError(
  failedTXError?: Horizon.HorizonApi.ErrorResponseData.TransactionFailed,
) {
  console.log("failedTXError", failedTXError);
  if (!failedTXError) return;
  const { extras } = failedTXError;
  let message = "Unknown error";
  if (!extras) {
    return message;
  }
  if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH
  ) {
    message = "Invalid transaction signature";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE
  ) {
    message = "Transaction expired. Please try again";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT
  ) {
    message = "Source account does not exist";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_FAILED,
    )
  ) {
    message = "One of the operations failed (none were applied)";
  } else if (extras.result_codes.operations?.includes("op_no_issuer")) {
    message = "The issuer account does not exist. ¿Has network been restored?";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_EARLY,
    )
  ) {
    message = "The ledger closeTime was before the minTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE,
    )
  ) {
    message = "The ledger closeTime was after the maxTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_MISSING_OPERATION,
    )
  ) {
    message = "No operation was specified";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ,
    )
  ) {
    message = "The sequence number does not match source account";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ
  ) {
    message = "The sequence number does not match source account";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH,
    )
  ) {
    message =
      "Check if you have the required permissions and signatures for this Network";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_BALANCE,
    )
  ) {
    message = "You don't have enough balance to perform this operation";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT,
    )
  ) {
    message = "The source account does not exist";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH_EXTRA,
    )
  ) {
    message = "There are unused signatures attached to the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_FEE,
    )
  ) {
    message = "The fee is insufficient for the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INTERNAL_ERROR,
    )
  ) {
    message = "An unknown error occurred while processing the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NOT_SUPPORTED,
    )
  ) {
    message = "The operation is not supported by the network";
  } else if (extras.result_codes.operations?.includes("op_buy_no_trust")) {
    message = "You need to establish trustline first";
  } else if (extras.result_codes.operations?.includes("op_low_reserve")) {
    message = "You don't have enough XLM to create the offer";
  } else if (extras.result_codes.operations?.includes("op_bad_auth")) {
    message =
      "There are missing valid signatures, or the transaction was submitted to the wrong network";
  } else if (extras.result_codes.operations?.includes("op_no_source_account")) {
    message = "There is no source account";
  } else if (extras.result_codes.operations?.includes("op_not_supported")) {
    message = "The operation is not supported by the network";
  } else if (
    extras.result_codes.operations?.includes("op_too_many_subentries")
  ) {
    message = "Max number of subentries (1000) already reached";
  }
  return message;
}

export function fromStroops(stroops: string | null): string {
  if (!stroops) return "0";
  return (Number(stroops) / 10_000_000).toFixed(7);
}

export function toStroops(xlm: string): string {
  return (Number(xlm) * 10_000_000).toFixed(0);
}

export function hasEnoughBalance(
  stroopsAvailable: number | string,
  stroopsToTransfer: number | string,
) {
  console.log("stroopsAvailable", stroopsAvailable);
  console.log("stroopsToTransfer", stroopsToTransfer);
  const balance =
    typeof stroopsAvailable === "string"
      ? parseInt(stroopsAvailable)
      : stroopsAvailable;
  const amount =
    typeof stroopsToTransfer === "string"
      ? parseInt(stroopsToTransfer)
      : stroopsToTransfer;

  return balance >= amount;
}

export const stringToSymbol = (val: string) => {
  return nativeToScVal(val, { type: "symbol" });
};

export const numberToU64 = (val: number) => {
  const num = parseInt((val * 100).toFixed(0));
  return nativeToScVal(num, { type: "u64" });
};

export const numberToU32 = (val: number) => {
  const num = parseInt((val * 100).toFixed(0));
  return nativeToScVal(num, { type: "u32" });
};

export const numberToi128 = (val: number) => {
  const num = parseInt((val * 100).toFixed(0));
  return nativeToScVal(num, { type: "i128" });
};

// Convert Stellar address to ScVal
export function addressToScVal(addressStr: string) {
  Address.fromString(addressStr);
  // Convert to ScVal as an Object with Bytes
  return nativeToScVal(Address.fromString(addressStr));
}

export async function getContractXDR(
  address: string,
  contractMethod: string,
  caller: string,
  values: xdr.ScVal[],
) {
  console.log("Here is the caller", caller);
  const provider = new SorobanRpc.Server(env.RPC_URL, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  console.log("Here is the source account", sourceAccount);
  const contract = new Contract(address);
  console.log("Here is the contract", contract);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(contractMethod, ...values))
    .setTimeout(30)
    .build();

  console.log("total signatures:", transaction.signatures.length);
  try {
    const prepareTx = await provider.prepareTransaction(transaction);

    return prepareTx.toXDR();
  } catch (e) {
    console.log("Error", e);
    throw new Error("Unable to send transaction");
  }
}

export async function callWithSignedXDR(xdr: string) {
  const provider = new SorobanRpc.Server(env.RPC_URL, { allowHttp: true });
  console.log(xdr);
  const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
  console.log("total signatures:", transaction.signatures.length);
  const sendTx = await provider.sendTransaction(transaction);
  console.log("sent TX");
  if (sendTx.errorResult) {
    console.log("Error", sendTx.errorResult);
    throw new Error("Unable to send transaction");
  }
  if (sendTx.status === "PENDING") {
    let txResponse = await provider.getTransaction(sendTx.hash);
    while (
      txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      txResponse = await provider.getTransaction(sendTx.hash);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      console.log("Success", txResponse);
      return txResponse.returnValue;
    } else {
      console.log("Error", txResponse);

      throw new Error("Unable to send transaction");
    }
  }
}

export const countries = [
  { value: "us", label: "United States" },
  { value: "ph", label: "Philippines" },
  { value: "mx", label: "Mexico" },
  { value: "co", label: "Colombia" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "in", label: "India" },
];

export const toPascalCase = (input: string): string => {
  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const mapCountry = (input?: string): string | undefined => {
  if (!input) return undefined;

  switch (
    input
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
  ) {
    case "US":
    case "USA":
    case "EEUU":
    case "EU":
    case "E.U.":
    case "E.U.A":
    case "AMERICA":
    case "MERICA":
    case "USTATES":
    case "U.S.A":
    case "UNITEDSTATES":
    case "UNITEDSTATESOFAMERICA":
    case "ESTADOSUNIDOS":
      return "us";
    case "PH":
    case "PHILIPPINES":
    case "PHILPPINES":
    case "PHILPINES":
    case "PHILLIPPINES":
    case "PHILIPPINEISLANDS":
    case "PHILIPPINAS":
    case "PILIPINAS":
    case "PILLIPINAS":
    case "PILIPPINES":
    case "PILLIPPINES":
      return "ph";
    case "MX":
    case "MEXICO":
    case "MEX":
    case "MEXICOESTADOSUNIDOS":
      return "mx";
    case "CO":
    case "COLOMBIA":
    case "REPUBLICADECOLOMBIA":
      return "co";
    case "CA":
    case "CANADA":
    case "CAN":
    case "CANUCK":
      return "ca";
    case "GB":
    case "UK":
    case "UNITEDKINGDOM":
    case "BRITAIN":
    case "ENGLAND":
    case "LONDON":
    case "GREATBRITAIN":
      return "gb";
    case "FR":
    case "FRANCE":
    case "FRANCIA":
    case "FRAN":
    case "FRANCAIS":
    case "FRENCH":
    case "PARIS":
    case "PARISIEN":
    case "LA FRANCE":
      return "fr";
    case "DE":
    case "GERMANY":
    case "ALEMANIA":
    case "DEUTSCHLAND":
    case "GER":
      return "de";
    case "AU":
    case "AUSTRALIA":
    case "AUS":
    case "DOWNUNDER":
    case "OZ":
      return "au";
    case "BR":
    case "BRAZIL":
    case "BRASIL":
    case "BRA":
    case "BRAS":
    case "BRASILIA":
      return "br";
    case "IN":
    case "INDIA":
    case "BHARAT":
    case "IND":
      return "in";
    default:
      return undefined;
  }
};

// Mapping of country codes to their respective ISO 4217 currency codes
export const countryCurrencyMap = {
  us: "USD",
  ph: "PHP",
  mx: "MXN",
  co: "COP",
  ca: "CAD",
  gb: "GBP",
  fr: "EUR",
  de: "EUR",
  au: "AUD",
  br: "BRL",
  in: "INR",
};

export const getRate = async (from: string, to: string): Promise<number> => {
  const response = await axios.get<{
    base: "USD";
    results: Record<string, number>;
    updated: string;
    ms: number;
  }>(
    `https://api.fastforex.io/fetch-multi?from=${from}&to=${to}&api_key=97240b59fa-9d256c22fb-smimi6`,
  );
  return response.data.results[to] ?? 0;
};

export const parsePhoneNumber = (phoneInput: string): string => {
  const input = phoneInput.trim();
  // Remove any non-numeric characters
  input.replace(/\D/g, "");
  // if "+" is not included, add it
  if (!input.startsWith("+")) {
    return `+${input}`;
  }
  return input;
};
