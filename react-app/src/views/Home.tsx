import React, {useContext} from "react";
import {Box, Flex, Spacer, Text} from "@chakra-ui/react";
import RadioIcon from "../components/icons/RadioIcon";
import { Link } from "react-router-dom"
import {WalletConnectContext} from "../context/WalletConnectContext";

export default function Home() {
    const walletConnectCtx = useContext(WalletConnectContext)

    return (<>
        <Spacer/>
        <Text maxW="44rem" color="#004e87" fontSize={["1.4rem", "2rem"]} textAlign="center"
              fontWeight="bold" m="0.5rem">
            If you want to securely pay someone a little bit at a time, CrypSydra is for you
        </Text>
        <Spacer/>
        <Box borderRadius="8px" backgroundColor="#0094ff" m="0.5rem"
             _hover={{textDecoration: 'none', backgroundColor: '#0081dc'}}>
            <Link to={!walletConnectCtx?.session ? '/connectToProceed' : '/createStream'} color="white">
                <Flex align="center" p={["0.5rem 1rem", "1rem 2rem"]}>
                    <RadioIcon boxSize="2.5rem" mr="1rem"/>
                    <Text fontSize="2rem" m={0}>Create a Stream</Text>
                </Flex>
            </Link>
        </Box>
        <Spacer/>
        <Spacer/>
    </>)
}