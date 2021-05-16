import React, {useContext, useEffect, useState} from "react";
import Client, {CLIENT_EVENTS} from "@walletconnect/client";
import {PairingTypes, SessionTypes} from "@walletconnect/types";
import {
    DEFAULT_APP_METADATA,
    DEFAULT_CHAIN_ID,
    DEFAULT_LOGGER,
    DEFAULT_METHODS,
    DEFAULT_RELAY_PROVIDER
} from "../constants";
import QRCodeModal from "@walletconnect/qrcode-modal";
import {ERROR, getAppMetadata, getError} from "@walletconnect/utils";
import {RequestArguments} from "@json-rpc-tools/types";

interface IWalletConnectContext {
    wcClient: Client | undefined,
    setWcClient: React.Dispatch<React.SetStateAction<Client | undefined>>,
    session: SessionTypes.Created | undefined,
    setSession: React.Dispatch<React.SetStateAction<SessionTypes.Created | undefined>>,
    pairings: string[],
    setPairings: React.Dispatch<React.SetStateAction<string[]>>,
    modal: string,
    setModal: React.Dispatch<React.SetStateAction<string>>,
    pending: boolean,
    setPending: React.Dispatch<React.SetStateAction<boolean>>,
    uri: string,
    setUri: React.Dispatch<React.SetStateAction<string>>,
    accounts: string[],
    setAccounts: React.Dispatch<React.SetStateAction<string[]>>,
    result: any | undefined,
    setResult: React.Dispatch<React.SetStateAction<any | undefined>>,

    onConnect: () => Promise<void>,
    connect: (pairing?: { topic: string }) => Promise<void>,
    rpcRequest: (request: RequestArguments) => Promise<void>,
}

export const WalletConnectContext = React.createContext<IWalletConnectContext | null>(null)

export const WalletConnectContextProvider: React.FC = ({ children }) => {
    const [wcClient, setWcClient] = useState<Client | undefined>(undefined)
    const [session, setSession] = useState<SessionTypes.Created | undefined>(undefined)
    const [pairings, setPairings] = useState<string[]>([])
    const [modal, setModal] = useState<string>("")
    const [pending, setPending] = useState<boolean>(false)
    const [uri, setUri] = useState<string>("")
    const [accounts, setAccounts] = useState<string[]>([])
    const [result, setResult] = useState<any | undefined>(undefined)

    useEffect(() => {
        initWcClient()
    }, [])

    useEffect(() => {
        if (wcClient) {
            subscribeToEvents()
            checkPersistedState()
        }
    }, [wcClient])

    const initWcClient = async () => {
        setWcClient(await Client.init({
            logger: DEFAULT_LOGGER,
            relayProvider: DEFAULT_RELAY_PROVIDER,
        }))
    }

    const subscribeToEvents = () => {
        if (typeof wcClient === "undefined") {
            return
        }

        wcClient.on(
            CLIENT_EVENTS.pairing.proposal,
            async (proposal: PairingTypes.Proposal) => {
                const {uri} = proposal.signal.params
                setUri(uri)
                QRCodeModal.open(uri, () => {
                    console.log("Modal callback")
                })
            },
        )

        wcClient.on(CLIENT_EVENTS.pairing.created, async (proposal: PairingTypes.Settled) => {
            if (typeof wcClient === "undefined") return
            setPairings(wcClient.pairing.topics)
        })

        wcClient.on(CLIENT_EVENTS.session.deleted, async (session: SessionTypes.Settled) => {
            if (session.topic !== session?.topic) return
            console.log("EVENT", "session_deleted")
            await resetApp()
        })
    }

    const checkPersistedState = async () => {
        if (typeof wcClient === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        // populates existing pairings to state
        setPairings(wcClient.pairing.topics)
        if (typeof session !== "undefined") return
        // populates existing session to state (assume only the top one)
        if (wcClient.session.topics.length) {
            const session = await wcClient.session.get(wcClient.session.topics[0])
            setAccounts(session.state.accounts)
            onSessionConnected(session)
        }
    }

    const connect = async (pairing?: { topic: string }) => {
        if (typeof wcClient === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        if (modal === "pairing") {
            closeModal()
        }
        try {
            const session = await wcClient.connect({
                metadata: getAppMetadata() || DEFAULT_APP_METADATA,
                pairing,
                permissions: {
                    blockchain: {
                        chains: [DEFAULT_CHAIN_ID],
                    },
                    jsonrpc: {
                        methods: DEFAULT_METHODS,
                    },
                },
            })

            onSessionConnected(session)
        } catch (e) {
            // ignore rejection
        }

        // close modal in case it was open
        QRCodeModal.close()
    }

    const disconnect = async () => {
        if (typeof wcClient === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        if (typeof session === "undefined") {
            throw new Error("Session is not connected")
        }
        await wcClient.disconnect({
            topic: session.topic,
            reason: getError(ERROR.USER_DISCONNECTED),
        })
    }

    const resetApp = async () => {
        // TODO: reset
    }

    const onSessionConnected = (session: SessionTypes.Settled) => {
        setSession(session)
        onSessionUpdate(session.state.accounts)
    }

    const onSessionUpdate = (accounts: string[]) => {
        setAccounts(accounts)
    }

    const openPairingModal = () => setModal("pairing")

    const openRequestModal = () => {
        setPending(true)
        setModal("request")
    }

    const closeModal = () => setModal("")

    const onConnect = async () => {
        console.log('ON CONNECT')
        if (typeof wcClient === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        if (wcClient.pairing.topics.length) {
            return openPairingModal()
        }
        await connect()
    }

    const rpcRequest = async (request: RequestArguments) => {
        if (typeof wcClient === "undefined") {
            throw new Error("WalletConnect is not initialized");
        }
        if (typeof session === "undefined") {
            throw new Error("Session is not connected");
        }

        try {
            const account = accounts[0]
            const [address] = account.split("@")

            // open modal
            openRequestModal();

            const result = await wcClient.request({
                topic: session.topic,
                chainId: DEFAULT_CHAIN_ID,
                request,
            });

            // format displayed result
            const formattedResult = {
                method: request.method,
                address,
                result,
            };

            // display result
            setPending(false)
            setResult(formattedResult || null)
        } catch (error) {
            console.error(error);
            setPending(false)
            setResult(null)
        }
    };

    const contextValue = {
        wcClient,
        setWcClient,
        session,
        setSession,
        pairings,
        setPairings,
        modal,
        setModal,
        pending,
        setPending,
        uri,
        setUri,
        accounts,
        setAccounts,
        result,
        setResult,

        onConnect,
        connect,
        rpcRequest,
    }

    return (
        <WalletConnectContext.Provider value={contextValue}>{children}</WalletConnectContext.Provider>
    );
}

export const useWalletConnect = () => useContext(WalletConnectContext)