import * as React from "react";

import Pairing from "../components/Pairing";
import {Button, ModalBody, ModalCloseButton, ModalFooter, ModalHeader} from "@chakra-ui/react";
import {useContext} from "react";
import {WalletConnectContext} from "../context/WalletConnectContext";

export default function PairingModal() {
    const walletConnectCtx = useContext(WalletConnectContext)

    return (
        <>
            <ModalHeader>Select available pairing or create new one</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
                {walletConnectCtx?.wcClient?.pairing.values.map(pairing => (
                    <Pairing
                        key={pairing.topic}
                        pairing={pairing}
                        onClick={() => walletConnectCtx.connect({topic: pairing.topic})}
                    />
                ))}
            </ModalBody>

            <ModalFooter>
                <Button onClick={() => walletConnectCtx?.connect()}>{`New Pairing`}</Button>
            </ModalFooter>
        </>
    );
};
