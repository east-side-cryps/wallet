import React, {useContext} from "react";
import {Link, Spacer, Text} from "@chakra-ui/react";
import WalletIcon from "../components/icons/WalletIcon";
import {WalletConnectContext} from "../context/WalletConnectContext";

export default function CreateStream() {
    const walletConnectCtx = useContext(WalletConnectContext)

    return (<>
        <Spacer/>
        To do
        <Spacer/>
        <Spacer/>
    </>)
}