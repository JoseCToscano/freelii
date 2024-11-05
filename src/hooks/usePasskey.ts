import { useState } from "react";
import { api } from "~/trpc/react";
import { useContractStore } from "~/hooks/stores/useContractStore";
import { useKeyStore } from "~/hooks/stores/useKeyStore";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";
import { account } from "~/lib/client-helpers";

export const usePasskey = (phoneNumber: string) => {
  const [loading, setLoading] = useState(false);
  const setContractId = useContractStore((state) => state.setContractId);
  const setKeyId = useKeyStore((state) => state.setKeyId);

  const { keyId } = useKeyStore.getState();

  const saveSigner = api.stellar.saveSigner.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  // Initialize tRPC mutation
  const { mutateAsync: sendTransaction, error } = api.stellar.send.useMutation({
    onSuccess: () => toast.success("Successfully sent XDR to Stellar network"),
    onError: ClientTRPCErrorHandler,
  });

  // Create a function to handle the wallet creation process
  const create = async (): Promise<string> => {
    try {
      setLoading(true);
      const user = "Freelii";
      const {
        keyId_base64,
        contractId: cid,
        built,
      } = await account.createWallet(user, phoneNumber);

      // Use tRPC mutation to send the transaction to the Stellar network
      const result = await sendTransaction({
        xdr: built.toXDR(),
      });
      if (result?.success) {
        // Store keyId and contractId in Zustand store
        setKeyId(keyId_base64);
        setContractId(cid);

        console.log("funding wallet");
        await saveSigner.mutateAsync({
          contractId: cid,
          signerId: keyId_base64,
          phone: phoneNumber,
        });
        // await fundWallet(cid);
        console.log("funded wallet");
        return cid;
      }
      throw new Error("Failed to create Stellar passkey");
    } catch (err) {
      toast.error(
        (err as Error)?.message ?? "Failed to create Stellar passkey",
      );
      throw new Error(
        (err as Error)?.message ?? "Failed to create Stellar passkey",
      );
    } finally {
      setLoading(false);
    }
  };

  const connect = async (): Promise<string> => {
    try {
      const { keyId_base64, contractId: cid } = await account.connectWallet();

      setKeyId(keyId_base64);
      setContractId(cid);

      console.log("KeyId: ", keyId_base64);
      console.log("ContractId: ", cid);
      toast.success(`Successfully extracted contract`);
      return cid;
    } catch (err) {
      toast.error((err as Error)?.message);
      throw err;
    }
  };

  const sign = async (xdr: string): Promise<string> => {
    console.log("will sign,", keyId);
    const signedXDR = await account.sign(xdr, { keyId: String(keyId) });
    console.log("signed xdr", typeof signedXDR, signedXDR);
    return signedXDR.toXDR();
  };

  return { create, loading, error, sign, connect };
};
