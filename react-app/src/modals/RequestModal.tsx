import * as React from "react";

import Loader from "../components/Loader";

import { SModalParagraph } from "./shared";
import {useWalletConnect} from "../context/WalletConnectContext";
import {Flex, ModalBody, ModalCloseButton, ModalHeader} from "@chakra-ui/react";
import {useEffect} from "react";

export default function RequestModal() {
  const walletConnectCtx = useWalletConnect()

  useEffect(() => {
    if (walletConnectCtx?.pending === false) {
      walletConnectCtx.setModal("")
    }
  }, [walletConnectCtx?.pending])

  return (<>
      <ModalHeader>{"Pending JSON-RPC Request"}</ModalHeader>
      <ModalCloseButton/>
      <ModalBody>
          <Flex direction="column" align="center">
            <Loader />
            <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
          </Flex>
      </ModalBody>
  </>)
};
