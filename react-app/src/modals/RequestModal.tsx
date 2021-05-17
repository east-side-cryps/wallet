import * as React from "react";

import Loader from "../components/Loader";

import {useWalletConnect} from "../context/WalletConnectContext";
import {Flex, Text, ModalBody, ModalCloseButton, ModalHeader} from "@chakra-ui/react";
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
            <Text fontWeight="bold">Approve or reject request using your wallet</Text>
          </Flex>
      </ModalBody>
  </>)
};
