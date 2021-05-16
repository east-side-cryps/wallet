import * as React from "react";
import {Modal, ModalContent, ModalOverlay} from "@chakra-ui/react";
import {useContext} from "react";
import {WalletConnectContext} from "../context/WalletConnectContext";
import PairingModal from "../modals/PairingModal";
import RequestModal from "../modals/RequestModal";

export default function ModalRouter () {
  const walletConnectCtx = useContext(WalletConnectContext)

  return (
      <Modal isOpen={!!walletConnectCtx?.modal} onClose={() => walletConnectCtx?.setModal("")}>
          <ModalOverlay/>
          <ModalContent>
              {
                  walletConnectCtx && {
                      pairing: <PairingModal/>,
                      request: <RequestModal/>,
                  }[walletConnectCtx.modal]
              }
          </ModalContent>
      </Modal>
  );
};
