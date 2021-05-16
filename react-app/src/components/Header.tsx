import * as React from "react";
import WaveIcon from "./icons/WaveIcon";
import {Flex, Link, Spacer, Spinner, Text} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import Blockchain from "./Blockchain";

export default function Header () {
  const walletConnectCtx = useWalletConnect()

  return (
      <Flex align="center" borderBottom="4px" borderColor="#0094FF" py="1rem" px={["1rem", "3rem"]}>
        <WaveIcon boxSize={["2rem", "2.5rem"]} mr={["0.3rem", "1rem"]} color="#004e87"/>
        <Text color="#004e87" fontSize={["1.8rem", "2.2rem"]} fontWeight="bold" m={0}>
          CrypSydra.com
        </Text>
        <Spacer/>
          {walletConnectCtx?.loadingSession ? <Spinner /> : (
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
