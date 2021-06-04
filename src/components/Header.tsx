import * as React from "react";
import {Flex, Image, Link, Spacer, Text} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import LogoutIcon from "./icon/LogoutIcon";
import {FileHelper} from "../helpers/FileHelper";
import {useAccountContext} from "../context/AccountContext";

const chainMeta = {
    name: 'Neo3',
    logo: 'https://cryptologos.cc/logos/neo-neo-logo.svg',
}

export default function Header() {
    const walletConnectCtx = useWalletConnect()
    const accountCtx = useAccountContext()

    const logout = async () => {
        accountCtx.setAccountPassword(undefined)
        accountCtx.setAccountDecripted(false)
        await walletConnectCtx.resetApp()
    }

    const ellipseAddress = (address = "", width = 10) => {
        return `${address.slice(0, width)}...${address.slice(-width)}`;
    }

    const exportAccount = async () => {
        const acc = walletConnectCtx.accounts[0]
        const json = walletConnectCtx.accounts[0].export()
        FileHelper.downloadJsonFile(acc?.address ?? '', json)
    }

    const isLoggedIn = () => {
        return !!walletConnectCtx.accounts.length && accountCtx.accountDecripted
    }

    return (
        <Flex align="center" bgColor="#00000033" borderBottom="1px" borderColor="#ffffff33" h={["3.5rem", "6rem"]} px={["1rem", "3rem"]}>
            <Flex direction="column" flex={1} align={isLoggedIn() ? 'start' : 'center'}>
                <Text fontSize="2.25rem" fontWeight="bold">Web Wallet</Text>
                <Text fontSize="0.875rem" color="#888888" textTransform="uppercase" mt="-0.5rem">For Tests</Text>
            </Flex>
            {isLoggedIn() && (
                <Flex direction="column" align="right">
                    {walletConnectCtx.accounts.map(account => (
                        <Flex
                            key={account.address}
                            align="center"
                        >
                            <Image src={chainMeta.logo} alt={chainMeta.name} title={chainMeta.name} w="1.6rem"
                                   mr="0.5rem"/>
                            <Flex direction="column">
                                <Text fontSize="0.875rem">{ellipseAddress(account.address, 8)}</Text>
                                <Link fontSize="0.875rem" mt="-0.3rem" color="#888888" onClick={exportAccount}>
                                    Download JSON File
                                </Link>
                            </Flex>
                            <Link ml="0.6rem" onClick={logout}>
                                <LogoutIcon boxSize="1.4rem" color="#888888"/>
                            </Link>
                        </Flex>
                        ))}
                </Flex>
            )}
        </Flex>
    );
}
