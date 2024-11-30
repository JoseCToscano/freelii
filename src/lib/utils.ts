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
  rpc as SorobanRpc,
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

export const countryCodes = [
  { value: "AF", label: "Afghanistan", code: "93" },
  { value: "AL", label: "Albania", code: "355" },
  { value: "DZ", label: "Algeria", code: "213" },
  { value: "AS", label: "American Samoa", code: "1-684" },
  { value: "AD", label: "Andorra", code: "376" },
  { value: "AO", label: "Angola", code: "244" },
  { value: "AI", label: "Anguilla", code: "1-264" },
  { value: "AQ", label: "Antarctica", code: "672" },
  { value: "AG", label: "Antigua and Barbuda", code: "1-268" },
  { value: "AR", label: "Argentina", code: "54" },
  { value: "AM", label: "Armenia", code: "374" },
  { value: "AW", label: "Aruba", code: "297" },
  { value: "AU", label: "Australia", code: "61" },
  { value: "AT", label: "Austria", code: "43" },
  { value: "AZ", label: "Azerbaijan", code: "994" },
  { value: "BS", label: "Bahamas", code: "1-242" },
  { value: "BH", label: "Bahrain", code: "973" },
  { value: "BD", label: "Bangladesh", code: "880" },
  { value: "BB", label: "Barbados", code: "1-246" },
  { value: "BY", label: "Belarus", code: "375" },
  { value: "BE", label: "Belgium", code: "32" },
  { value: "BZ", label: "Belize", code: "501" },
  { value: "BJ", label: "Benin", code: "229" },
  { value: "BM", label: "Bermuda", code: "1-441" },
  { value: "BT", label: "Bhutan", code: "975" },
  { value: "BO", label: "Bolivia", code: "591" },
  { value: "BA", label: "Bosnia and Herzegovina", code: "387" },
  { value: "BW", label: "Botswana", code: "267" },
  { value: "BR", label: "Brazil", code: "55" },
  { value: "IO", label: "British Indian Ocean Territory", code: "246" },
  { value: "VG", label: "British Virgin Islands", code: "1-284" },
  { value: "BN", label: "Brunei", code: "673" },
  { value: "BG", label: "Bulgaria", code: "359" },
  { value: "BF", label: "Burkina Faso", code: "226" },
  { value: "BI", label: "Burundi", code: "257" },
  { value: "KH", label: "Cambodia", code: "855" },
  { value: "CM", label: "Cameroon", code: "237" },
  { value: "CA", label: "Canada", code: "1" },
  { value: "CV", label: "Cape Verde", code: "238" },
  { value: "KY", label: "Cayman Islands", code: "1-345" },
  { value: "CF", label: "Central African Republic", code: "236" },
  { value: "TD", label: "Chad", code: "235" },
  { value: "CL", label: "Chile", code: "56" },
  { value: "CN", label: "China", code: "86" },
  { value: "CX", label: "Christmas Island", code: "61" },
  { value: "CC", label: "Cocos Islands", code: "61" },
  { value: "CO", label: "Colombia", code: "57" },
  { value: "KM", label: "Comoros", code: "269" },
  { value: "CK", label: "Cook Islands", code: "682" },
  { value: "CR", label: "Costa Rica", code: "506" },
  { value: "HR", label: "Croatia", code: "385" },
  { value: "CU", label: "Cuba", code: "53" },
  { value: "CW", label: "Curacao", code: "599" },
  { value: "CY", label: "Cyprus", code: "357" },
  { value: "CZ", label: "Czech Republic", code: "420" },
  { value: "CD", label: "Democratic Republic of the Congo", code: "243" },
  { value: "DK", label: "Denmark", code: "45" },
  { value: "DJ", label: "Djibouti", code: "253" },
  { value: "DM", label: "Dominica", code: "1-767" },
  { value: "DO", label: "Dominican Republic", code: "1-809" },
  { value: "TL", label: "East Timor", code: "670" },
  { value: "EC", label: "Ecuador", code: "593" },
  { value: "EG", label: "Egypt", code: "20" },
  { value: "SV", label: "El Salvador", code: "503" },
  { value: "GQ", label: "Equatorial Guinea", code: "240" },
  { value: "ER", label: "Eritrea", code: "291" },
  { value: "EE", label: "Estonia", code: "372" },
  { value: "ET", label: "Ethiopia", code: "251" },
  { value: "FK", label: "Falkland Islands", code: "500" },
  { value: "FO", label: "Faroe Islands", code: "298" },
  { value: "FJ", label: "Fiji", code: "679" },
  { value: "FI", label: "Finland", code: "358" },
  { value: "FR", label: "France", code: "33" },
  { value: "PF", label: "French Polynesia", code: "689" },
  { value: "GA", label: "Gabon", code: "241" },
  { value: "GM", label: "Gambia", code: "220" },
  { value: "GE", label: "Georgia", code: "995" },
  { value: "DE", label: "Germany", code: "49" },
  { value: "GH", label: "Ghana", code: "233" },
  { value: "GI", label: "Gibraltar", code: "350" },
  { value: "GR", label: "Greece", code: "30" },
  { value: "GL", label: "Greenland", code: "299" },
  { value: "GD", label: "Grenada", code: "1-473" },
  { value: "GU", label: "Guam", code: "1-671" },
  { value: "GT", label: "Guatemala", code: "502" },
  { value: "GG", label: "Guernsey", code: "44-1481" },
  { value: "GN", label: "Guinea", code: "224" },
  { value: "GW", label: "Guinea-Bissau", code: "245" },
  { value: "GY", label: "Guyana", code: "592" },
  { value: "HT", label: "Haiti", code: "509" },
  { value: "HN", label: "Honduras", code: "504" },
  { value: "HK", label: "Hong Kong", code: "852" },
  { value: "HU", label: "Hungary", code: "36" },
  { value: "IS", label: "Iceland", code: "354" },
  { value: "IN", label: "India", code: "91" },
  { value: "ID", label: "Indonesia", code: "62" },
  { value: "IR", label: "Iran", code: "98" },
  { value: "IQ", label: "Iraq", code: "964" },
  { value: "IE", label: "Ireland", code: "353" },
  { value: "IM", label: "Isle of Man", code: "44-1624" },
  { value: "IL", label: "Israel", code: "972" },
  { value: "IT", label: "Italy", code: "39" },
  { value: "CI", label: "Ivory Coast", code: "225" },
  { value: "JM", label: "Jamaica", code: "1-876" },
  { value: "JP", label: "Japan", code: "81" },
  { value: "JE", label: "Jersey", code: "44-1534" },
  { value: "JO", label: "Jordan", code: "962" },
  { value: "KZ", label: "Kazakhstan", code: "7" },
  { value: "KE", label: "Kenya", code: "254" },
  { value: "KI", label: "Kiribati", code: "686" },
  { value: "XK", label: "Kosovo", code: "383" },
  { value: "KW", label: "Kuwait", code: "965" },
  { value: "KG", label: "Kyrgyzstan", code: "996" },
  { value: "LA", label: "Laos", code: "856" },
  { value: "LV", label: "Latvia", code: "371" },
  { value: "LB", label: "Lebanon", code: "961" },
  { value: "LS", label: "Lesotho", code: "266" },
  { value: "LR", label: "Liberia", code: "231" },
  { value: "LY", label: "Libya", code: "218" },
  { value: "LI", label: "Liechtenstein", code: "423" },
  { value: "LT", label: "Lithuania", code: "370" },
  { value: "LU", label: "Luxembourg", code: "352" },
  { value: "MO", label: "Macau", code: "853" },
  { value: "MK", label: "Macedonia", code: "389" },
  { value: "MG", label: "Madagascar", code: "261" },
  { value: "MW", label: "Malawi", code: "265" },
  { value: "MY", label: "Malaysia", code: "60" },
  { value: "MV", label: "Maldives", code: "960" },
  { value: "ML", label: "Mali", code: "223" },
  { value: "MT", label: "Malta", code: "356" },
  { value: "MH", label: "Marshall Islands", code: "692" },
  { value: "MR", label: "Mauritania", code: "222" },
  { value: "MU", label: "Mauritius", code: "230" },
  { value: "YT", label: "Mayotte", code: "262" },
  { value: "MX", label: "Mexico", code: "52", emoji: "🇲🇽" },
  { value: "FM", label: "Micronesia", code: "691" },
  { value: "MD", label: "Moldova", code: "373" },
  { value: "MC", label: "Monaco", code: "377" },
  { value: "MN", label: "Mongolia", code: "976" },
  { value: "ME", label: "Montenegro", code: "382" },
  { value: "MS", label: "Montserrat", code: "1-664" },
  { value: "MA", label: "Morocco", code: "212" },
  { value: "MZ", label: "Mozambique", code: "258" },
  { value: "MM", label: "Myanmar", code: "95" },
  { value: "NA", label: "Namibia", code: "264" },
  { value: "NR", label: "Nauru", code: "674" },
  { value: "NP", label: "Nepal", code: "977" },
  { value: "NL", label: "Netherlands", code: "31" },
  { value: "AN", label: "Netherlands Antilles", code: "599" },
  { value: "NC", label: "New Caledonia", code: "687" },
  { value: "NZ", label: "New Zealand", code: "64" },
  { value: "NI", label: "Nicaragua", code: "505" },
  { value: "NE", label: "Niger", code: "227" },
  { value: "NG", label: "Nigeria", code: "234" },
  { value: "NU", label: "Niue", code: "683" },
  { value: "KP", label: "North Korea", code: "850" },
  { value: "MP", label: "Northern Mariana Islands", code: "1-670" },
  { value: "NO", label: "Norway", code: "47" },
  { value: "OM", label: "Oman", code: "968" },
  { value: "PK", label: "Pakistan", code: "92" },
  { value: "PW", label: "Palau", code: "680" },
  { value: "PS", label: "Palestine", code: "970" },
  { value: "PA", label: "Panama", code: "507" },
  { value: "PG", label: "Papua New Guinea", code: "675" },
  { value: "PY", label: "Paraguay", code: "595" },
  { value: "PE", label: "Peru", code: "51" },
  { value: "PH", label: "Philippines", code: "63" },
  { value: "PN", label: "Pitcairn", code: "64" },
  { value: "PL", label: "Poland", code: "48" },
  { value: "PT", label: "Portugal", code: "351" },
  { value: "PR", label: "Puerto Rico", code: "1-787" },
  { value: "QA", label: "Qatar", code: "974" },
  { value: "CG", label: "Republic of the Congo", code: "242" },
  { value: "RE", label: "Reunion", code: "262" },
  { value: "RO", label: "Romania", code: "40" },
  { value: "RU", label: "Russia", code: "7" },
  { value: "RW", label: "Rwanda", code: "250" },
  { value: "BL", label: "Saint Barthelemy", code: "590" },
  { value: "SH", label: "Saint Helena", code: "290" },
  { value: "KN", label: "Saint Kitts and Nevis", code: "1-869" },
  { value: "LC", label: "Saint Lucia", code: "1-758" },
  { value: "MF", label: "Saint Martin", code: "590" },
  { value: "PM", label: "Saint Pierre and Miquelon", code: "508" },
  { value: "VC", label: "Saint Vincent and the Grenadines", code: "1-784" },
  { value: "WS", label: "Samoa", code: "685" },
  { value: "SM", label: "San Marino", code: "378" },
  { value: "ST", label: "Sao Tome and Principe", code: "239" },
  { value: "SA", label: "Saudi Arabia", code: "966" },
  { value: "SN", label: "Senegal", code: "221" },
  { value: "RS", label: "Serbia", code: "381" },
  { value: "SC", label: "Seychelles", code: "248" },
  { value: "SL", label: "Sierra Leone", code: "232" },
  { value: "SG", label: "Singapore", code: "65" },
  { value: "SX", label: "Sint Maarten", code: "1-721" },
  { value: "SK", label: "Slovakia", code: "421" },
  { value: "SI", label: "Slovenia", code: "386" },
  { value: "SB", label: "Solomon Islands", code: "677" },
  { value: "SO", label: "Somalia", code: "252" },
  { value: "ZA", label: "South Africa", code: "27" },
  { value: "KR", label: "South Korea", code: "82" },
  { value: "SS", label: "South Sudan", code: "211" },
  { value: "ES", label: "Spain", code: "34" },
  { value: "LK", label: "Sri Lanka", code: "94" },
  { value: "SD", label: "Sudan", code: "249" },
  { value: "SR", label: "Suriname", code: "597" },
  { value: "SJ", label: "Svalbard and Jan Mayen", code: "47" },
  { value: "SZ", label: "Swaziland", code: "268" },
  { value: "SE", label: "Sweden", code: "46" },
  { value: "CH", label: "Switzerland", code: "41" },
  { value: "SY", label: "Syria", code: "963" },
  { value: "TW", label: "Taiwan", code: "886" },
  { value: "TJ", label: "Tajikistan", code: "992" },
  { value: "TZ", label: "Tanzania", code: "255" },
  { value: "TH", label: "Thailand", code: "66" },
  { value: "TG", label: "Togo", code: "228" },
  { value: "TK", label: "Tokelau", code: "690" },
  { value: "TO", label: "Tonga", code: "676" },
  { value: "TT", label: "Trinidad and Tobago", code: "1-868", emoji: "🇹🇹" },
  { value: "TN", label: "Tunisia", code: "216" },
  { value: "TR", label: "Turkey", code: "90" },
  { value: "TM", label: "Turkmenistan", code: "993" },
  { value: "TC", label: "Turks and Caicos Islands", code: "1-649" },
  { value: "TV", label: "Tuvalu", code: "688" },
  { value: "VI", label: "U.S. Virgin Islands", code: "1-340" },
  { value: "UG", label: "Uganda", code: "256" },
  { value: "UA", label: "Ukraine", code: "380" },
  { value: "AE", label: "United Arab Emirates", code: "971" },
  { value: "GB", label: "United Kingdom", code: "44" },
  { value: "US", label: "United States", code: "1" },
  { value: "UY", label: "Uruguay", code: "598" },
  { value: "UZ", label: "Uzbekistan", code: "998" },
  { value: "VU", label: "Vanuatu", code: "678" },
  { value: "VA", label: "Vatican", code: "379" },
  { value: "VE", label: "Venezuela", code: "58" },
  { value: "VN", label: "Vietnam", code: "84" },
  { value: "WF", label: "Wallis and Futuna", code: "681" },
  { value: "EH", label: "Western Sahara", code: "212" },
  { value: "YE", label: "Yemen", code: "967" },
  { value: "ZM", label: "Zambia", code: "260" },
  { value: "ZW", label: "Zimbabwe", code: "263" },
];

export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
};

export const formatMoney = (input: string): string => {
  console.log("input", input);
  if (!input) return "";
  let value = "$";
  const number = Number(input);
  const numberString = number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  value += numberString;
  console.log("value", value);
  return value;
};
