import {Button, Link, Spacer, Spinner, Text, useToast, Flex, Box} from "@chakra-ui/react";
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
import {format, formatDuration, intervalToDuration} from 'date-fns';

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
    const [time, setTime] = useState<string|undefined>(undefined)

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

    useEffect(() => {
        updateCountDown()
    }, [])

    const withdrawnValue = () => {
        if (stream?.deposit && stream?.remaining) {
            return stream.deposit - stream.remaining
        }
        return 0 // TODO: deposit - remaining
    }

    const withdrawnPct = () => {
        if (stream?.deposit) {
            return (withdrawnValue()/stream.deposit) * 100
        }
        return 0 // TODO: (withdrawValue/deposit) * 100
    }

    const startFormatted = () => {
        if (stream?.start) {
            return format(stream.start, 'yyyy/MM/dd HH:mm:ss')
        }
        return '' // TODO: start formatted with date-fns
    }

    const endFormatted = () => {
        if (stream?.stop) {
            return format(stream.stop, 'yyyy/MM/dd HH:mm:ss')
        }
        return '' // TODO: end formatted with date-fns
    }

    const streamedValue = () => {
        return 0 // TODO: make a Cross-multiplication (regra de 3) using `start`, `end` and current datetime
    }

    const streamedPct = () => {
        return 0 // TODO: (streamedValue/deposit) * 100
    }

    const countDownMiliseconds = () => {
        if (stream?.stop) {
            const now = new Date().getMilliseconds()
            return stream?.stop - now
        }
        return 0 // TODO: end - currentTimeInMilis
    }

    const countDownFormatted = () => {
        const readableTime = intervalToDuration({start: new Date(), end: countDownMiliseconds()})
        return formatDuration(readableTime)// TODO: format the countdown with date-fns
    }

    const updateCountDown = async () => {
        if (stream?.stop) {
            const now = new Date()
            const timeMili = stream?.stop - now.getMilliseconds()
            const readableTime = intervalToDuration({start: new Date(), end: timeMili})
            await setTime(formatDuration(readableTime))
            await sleep(1000)
            await updateCountDown()
        }
    }

    const sleep = (time: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
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
            <Flex direction="column" width="60rem" fontWeight="bold" fontSize="0.875rem" color="#004e87">
                <Flex marginBottom="0.5rem">
                    <Flex direction="column">
                        <Text fontSize="1.5rem">{withdrawnValue()}</Text>
                        <Text>Gas Withdrawn</Text>
                    </Flex>
                    <Spacer/>
                    <Flex direction="column"  textAlign="center">
                        <Text fontSize="1.5rem">{streamedValue()}</Text>
                        <Text>Gas Streamed</Text>
                    </Flex>
                    <Spacer/>
                    <Flex direction="column" textAlign="right">
                        <Text fontSize="1.5rem">{stream?.deposit ?? "-"}</Text>
                        <Text>Gas Total</Text>
                    </Flex>
                </Flex>
                <Box bg="white" width="60rem" height="3rem" borderRadius="6.25rem" overflow="hidden">
                    <Box bg="#0094ff" width="60%" height="3rem" borderRadius="6.25rem">
                        <Box bg="#004e87" width={"30%"} height="3rem" borderRadius="6.25rem"/>
                    </Box>
                </Box>
                <Flex marginTop="0.5rem">
                    <Text>Started at {startFormatted()}</Text>
                    <Spacer/>
                    <Text>Ends at {endFormatted()}</Text>
                </Flex>
            </Flex>
            <Spacer/>
            <Text color="#004e87" fontSize="2rem" fontWeight="bold" textAlign="center">{time}</Text>
            <Spacer/>
            <Link color="white" borderRadius="0.5rem" backgroundColor="#0094ff" m="0.5rem" p={["0.5rem 1rem", "0.8rem 12rem"]}
                  textAlign="center"
                  _hover={{textDecoration: 'none', backgroundColor: '#0081dc'}}>
                <Text fontSize="2rem" m={0}>Withdraw</Text>
            </Link>
            <Flex>
                <Link color="#0094ff" borderRadius="0.5rem" backgroundColor="white" m="0.5rem" p={["0.5rem 1rem", "0.8rem 5rem"]}
                      textAlign="center"
                      _hover={{textDecoration: 'none', backgroundColor: 'gray.100'}}>
                    <Text fontSize="2rem" m={0}>Share</Text>
                </Link>
                <Link color="white" borderRadius="0.5rem" backgroundColor="#004e87" m="0.5rem" p={["0.5rem 1rem", "0.8rem 2rem"]}
                      textAlign="center"
                      _hover={{textDecoration: 'none', backgroundColor: '#0081dc'}}>
                    <Text fontSize="2rem" m={0}>Cancel Stream</Text>
                </Link>
            </Flex>
            <Spacer/>
            <Button onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
            <WithdrawModal isOpen={withdrawOpen} onClose={withdraw} />
        </>)}
    </>)
}