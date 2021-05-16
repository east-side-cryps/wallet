import {Link, Spacer, Text} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import {useParams} from "react-router-dom";

export default function StreamDetails() {
    let {id} = useParams<{id: string}>();
    const walletConnectCtx = useWalletConnect()

    return (<>
        <Spacer/>
        <Text color="#004e87" fontSize={["1.4rem", "2rem"]} textAlign="center" m="0.5rem">
            {id}
        </Text>
        <Spacer/>
        <Spacer/>
    </>)
}