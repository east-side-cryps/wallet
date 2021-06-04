import * as React from "react";
import {Button, DividerProps, Flex, Input, Spacer} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import Blockchain from "./Blockchain";
import {DEFAULT_CHAIN_ID} from "../constants";
import {FileHelper} from "../helpers/FileHelper";
import {wallet} from "@cityofzion/neon-js";
import {useCallback, useEffect} from "react";
import KeyValueStorage from "keyvaluestorage";
import {AccountJSON} from "@cityofzion/neon-core/lib/wallet/Account";
import {useAccountContext} from "../context/AccountContext";

export default function AccountEntry(props: DividerProps) {
    const walletConnectCtx = useWalletConnect()
    const accountCtx = useAccountContext()

    const loadAccountFromStorage = useCallback(async (storage: KeyValueStorage) => {
        const json = await storage.getItem<Partial<AccountJSON>>("account")
        if (json) {
            const account = new wallet.Account(json)
            walletConnectCtx.setAccounts([account])
        }
    }, [walletConnectCtx])

    useEffect(() => {
        if (walletConnectCtx.storage) {
            loadAccountFromStorage(walletConnectCtx.storage)
        }
    }, [loadAccountFromStorage, walletConnectCtx.storage])

    const login = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        await passwordOnAccount()
        await walletConnectCtx.initClient()
    }

    const passwordOnAccount = async () => {
        if (walletConnectCtx.accounts.length && accountCtx.accountPassword && walletConnectCtx.storage) {
            const acc = walletConnectCtx.accounts[0]
            await acc.decrypt(accountCtx.accountPassword)
            walletConnectCtx.setAccounts([acc])
            accountCtx.setAccountDecripted(true)

            try {
                await acc.encrypt(accountCtx.accountPassword)
            } catch (e) {}
            await walletConnectCtx.storage.setItem("account", acc.export())
        }
    }

    const importAccount = async () => {
        const file = await FileHelper.promptForSingleFile("json")
        const json = await file?.text()
        if (json) {
            const acc = JSON.parse(json)
            const account = new wallet.Account(acc)
            walletConnectCtx.setAccounts([account])
        }
    }

    const createAccount = async () => {
        const account = new wallet.Account()
        walletConnectCtx.setAccounts([account])
    }

    return (
        <Flex direction="column" align="center" {...props}>
            <Spacer />
            <h6>{"Accounts"}</h6>
            <Flex>
                {!!walletConnectCtx.accounts.length ? (walletConnectCtx.accounts.map(account => (
                    <Blockchain
                        key={`default:account:${account.address}`}
                        chainId={DEFAULT_CHAIN_ID}
                        address={account.address}
                    />
                ))) : null}
                <Button onClick={importAccount}>{`Import`}</Button>
                <Button onClick={createAccount}>{`Create`}</Button>
            </Flex>
            {!!walletConnectCtx.accounts.length && (
                <Flex as="form" onSubmit={login}>
                    <Flex>
                        <Input type={`password`} onChange={(e: any) => accountCtx.setAccountPassword(e.target.value)}
                                placeholder={"Password"}/>
                        <Button type="submit">{`Login`}</Button>
                    </Flex>
                </Flex>
            )}
            <Spacer />
        </Flex>
    );
}
