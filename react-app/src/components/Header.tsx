import * as React from "react";
import WaveIcon from "./icons/WaveIcon";
import {Flex, Link, Spacer, Spinner, Text, useToast} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import Blockchain from "./Blockchain";
import {matchPath, useLocation} from "react-router-dom";
import CopyIcon from "./icons/CopyIcon";
import copy from "clipboard-copy";
import {useEffect, useState} from "react";

export default function Header() {
    const walletConnectCtx = useWalletConnect()
    let location = useLocation()
    const toast = useToast()
    const [id, setId] = useState<string | undefined>(undefined)

    useEffect(() => {
        const path = matchPath<{ id: string | undefined }>(location.pathname, {path: '/stream/:id'})
        setId(path?.params.id)
    }, [location])

    const copyUrl = () => {
        copy(window.location.href)

        toast({
            title: "URL copied to clipboard",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    return (
        <Flex align="center" borderBottom="4px" borderColor="#0094FF" py="1rem" px={["1rem", "3rem"]}>
            <WaveIcon boxSize={["2rem", "2.5rem"]} mr={["0.3rem", "1rem"]} color="#004e87"/>
            <Text display={['none', 'block']} color="#004e87" fontSize="2.2rem" fontWeight="bold" m={0}>
                CrypSydra.com
            </Text>
            {!!id && (<>
                <Text display={['none', 'block']} color="#0094ff" fontWeight="bold" fontSize="1.6rem" mb="0" mt="0.5rem"
                      ml="0.5rem">/stream/{id}</Text>
                <Link onClick={copyUrl} display={['none', 'block']}>
                    <CopyIcon boxSize="1.4rem" color="#333" ml="0.5rem" mt="0.5rem"/>
                </Link>
            </>)}
            <Spacer/>
            {walletConnectCtx?.loadingSession ? <Spinner/> : (
                !walletConnectCtx?.session ? (
                    <Link fontSize={["0.9rem", "1.125rem"]} textAlign="right" m={0}
                          onClick={walletConnectCtx?.onConnect}>Connect your Wallet</Link>
                ) : (
                    <Flex direction="column" align="right">
                        <Text fontSize="0.5rem" m={0}>{walletConnectCtx.session.peer.metadata.name}</Text>
                        {walletConnectCtx.accounts.map(account => {
                            const [address] = account.split("@");
                            return (
                                <Blockchain
                                    key={account}
                                    address={address}
                                />
                            );
                        })}
                    </Flex>
                )
            )}
        </Flex>
    );
}
