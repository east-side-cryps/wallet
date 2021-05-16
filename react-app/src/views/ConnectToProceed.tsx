import {Link, Spacer, Text} from "@chakra-ui/react";
import WalletIcon from "../components/icons/WalletIcon";
import {useWalletConnect} from "../context/WalletConnectContext";

export default function ConnectToProceed() {
    const walletConnectCtx = useWalletConnect()

    return (<>
        <Spacer/>
        <Text color="#004e87" fontSize={["1.4rem", "2rem"]} textAlign="center" m="0.5rem">
            You need to connect to your wallet before proceeding
        </Text>
        <WalletIcon boxSize="10rem" color="#004e87" m="2rem"/>
        <Link color="white" borderRadius="8px" backgroundColor="#0094ff" m="0.5rem" p={["0.5rem 1rem", "0.8rem 4rem"]}
              textAlign="center"
              _hover={{textDecoration: 'none', backgroundColor: '#0081dc'}}
              onClick={walletConnectCtx?.onConnect}>
            <Text fontSize="2rem" m={0}>Connect Wallet</Text>
        </Link>
        <Spacer/>
        <Spacer/>
    </>)
}