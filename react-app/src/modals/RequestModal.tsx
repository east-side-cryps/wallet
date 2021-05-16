import * as React from "react";

import Loader from "../components/Loader";
import { STable, SRow, SKey, SValue } from "../components/shared";

import { SModalParagraph } from "./shared";
import {useWalletConnect} from "../context/WalletConnectContext";
import {ModalBody, ModalCloseButton, ModalHeader} from "@chakra-ui/react";

const formatResultValue = (value: any) => {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  } else {
    return value.toString()
  }
}

export default function RequestModal() {
  const walletConnectCtx = useWalletConnect()

  return (
    <>
      {walletConnectCtx?.pending ? (
          <>
            <ModalHeader>{"Pending JSON-RPC Request"}</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
              <Loader />
              <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
            </ModalBody>
          </>
      ) : walletConnectCtx?.result ? (
        <>
          <ModalHeader>
            {walletConnectCtx.result.valid !== false ? "JSON-RPC Request Approved" : "JSON-RPC Request Failed"}
          </ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <STable>
              {Object.keys(walletConnectCtx.result).map(key => (
                <SRow key={key}>
                  <SKey>{key}</SKey>
                  <SValue>{formatResultValue(walletConnectCtx.result[key])}</SValue>
                </SRow>
              ))}
            </STable>
          </ModalBody>
        </>
      ) : (
        <>
          <ModalHeader>{"JSON-RPC Request Rejected"}</ModalHeader>
          <ModalCloseButton/>
        </>
      )}
    </>
  );
};
