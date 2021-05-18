import {Button, Link, Spacer, Spinner, Text, useToast} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Neon, {rpc, sc, wallet} from "@cityofzion/neon-js";
import {
    DEFAULT_GAS_SCRIPTHASH,
    DEFAULT_NEO_NETWORK_MAGIC,
    DEFAULT_NEO_RPC_ADDRESS,
    DEFAULT_SC_SCRIPTHASH
} from "../constants";
import {useWalletConnect} from "../context/WalletConnectContext";
import {N3Helper} from "../helpers/N3Helper";
import WithdrawModal from "../components/modals/WithdrawModal";
import {ContractParamJson} from "@cityofzion/neon-core/lib/sc";

interface Stream {
    deposit: number,
    id: number,
    recipient: string,
    remaining: number,
    sender: string,
    start: number,
    stop: number,
}

export default function StreamDetails() {
    const walletConnectCtx = useWalletConnect()
    let {id} = useParams<{id: string}>();
    const toast = useToast()
    const [loading, setLoading] = useState(true)
    const [withdrawOpen, setWithdrawOpen] = useState(false)
    const [stream, setStream] = useState<Stream | undefined>(undefined)

    const n3Helper = new N3Helper(DEFAULT_NEO_RPC_ADDRESS, DEFAULT_NEO_NETWORK_MAGIC)

    const loadStream = async () => {
        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(DEFAULT_SC_SCRIPTHASH),
            {
                networkMagic: DEFAULT_NEO_NETWORK_MAGIC,
                rpcAddress: DEFAULT_NEO_RPC_ADDRESS
            }
        );

        let resp
        try {
            resp = await contract.testInvoke('getStream', [sc.ContractParam.integer(Number(id))])
        } catch (e) {
            resp = { error: {message: e.message, ...e} }
        }

        const retrievedStream = JSON.parse(atob(resp.stack?.[0].value as string))
        setStream(retrievedStream)
        setLoading(false)
    }

    useEffect(() => {
        loadStream()
    }, [])

    const withdrawnValue = () => {
        return 0 // TODO: deposit - remaining
    }

    const withdrawnPct = () => {
        return 0 // TODO: (withdrawValue/deposit) * 100
    }

    const startFormatted = () => {
        return '' // TODO: start formatted with date-fns
    }

    const endAsMoment = () => {
        return '' // TODO: end formatted with date-fns
    }

    const streamedValue = () => {
        return 0 // TODO: make a Cross-multiplication (regra de 3) using `start`, `end` and current datetime
    }

    const streamedPct = () => {
        return 0 // TODO: (streamedValue/deposit) * 100
    }

    const countDownMiliseconds = () => {
        return 0 // TODO: end - currentTimeInMilis
    }

    const countDownFormatted = () => {
        return '' // TODO: format the countdown with date-fns
    }

    const share = () => {
        // TODO: use share-api-polyfill
    }

    const withdraw = async (amountToWithdraw: number) => {
        setWithdrawOpen(false)
        if (!walletConnectCtx || amountToWithdraw <= 0) return

        const streamId = {type: 'Integer', value: Number(id)}
        const value = {type: 'Integer', value: amountToWithdraw}

        const resp = await walletConnectCtx.rpcRequest({
            method: 'invokefunction',
            params: [DEFAULT_SC_SCRIPTHASH, 'withdraw', [streamId, value]],
        })

        if (resp.result.error && resp.result.error.message) {
            toast({
                title: resp.result.error.message,
                status: "error",
                duration: 10000,
                isClosable: true,
            })
            return
        }

        setLoading(true)
        const notification = (await n3Helper.getNotificationsFromTxId(resp.result))
            .find(n => {
                console.log(n.contract, DEFAULT_GAS_SCRIPTHASH, n.contract === DEFAULT_GAS_SCRIPTHASH)
                console.log(n.eventname, 'Transfer', n.eventname === 'Transfer')
                return n.contract === DEFAULT_GAS_SCRIPTHASH && n.eventname === 'Transfer'
            })
        if (!notification) return
        const notificationValues = notification.state.value as ContractParamJson[]
        if (!notificationValues || notificationValues.length < 3) return
        const recipient = wallet.getAddressFromScriptHash(Neon.u.base642hex(notificationValues[1].value as string))
        const amount = Number(notificationValues[2].value)

        toast({
            title: "Success!",
            description: `${amount} GAS was sent to ${recipient}`,
            status: "success",
            duration: 4000,
            isClosable: true,
        })

        await loadStream()
        setLoading(false)
    }

    return (<>
        {loading ? <><Spacer/><Spinner /><Spacer/></> : (<>
            <Spacer/>
            <Text color="#004e87" fontSize={["1.4rem", "2rem"]} textAlign="center" m="0.5rem">
                {id}
            </Text>
            <Spacer/>
            <Spacer/>
            <Button onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
            <WithdrawModal isOpen={withdrawOpen} onClose={withdraw} />
        </>)}
    </>)
}