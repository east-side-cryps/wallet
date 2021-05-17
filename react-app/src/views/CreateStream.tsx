import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {
    Flex,
    Spacer,
    Text,
    FormControl,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    FormLabel, Button, Spinner
} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import {DEFAULT_NEO_RPC_ADDRESS, DEFAULT_SC_SCRIPTHASH} from "../constants";
import {rpc} from "@cityofzion/neon-js";
import {ContractParamJson} from "@cityofzion/neon-core/lib/sc";

const formControlStyle = {
    maxWidth: "35rem", marginBottom: "2rem"
}

const formLabelStyle = {
    color: "#004e87", fontSize: "0.8rem", margin: 0
}
const inputStyle = {
    border: "solid 1px #0094ff",
    backgroundColor: "white",
    borderRadius: 0,
    height: "3.5rem",
}

export default function CreateStream() {
    const walletConnectCtx = useWalletConnect()
    const history = useHistory()

    const [recipientAddress, setRecipientAddress] = useState('')
    const [totalAmountOfGas, setTotalAmountOfGas] = useState(0)
    const [startDatetime, setStartDatetime] = useState('')
    const [endDatetime, setEndDatetime] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!walletConnectCtx?.loadingSession) {
            if (!walletConnectCtx?.session) {
                history.push('/connectToProceed')
            } else {
                setLoading(false)
            }
        }
    }, [walletConnectCtx?.loadingSession, walletConnectCtx?.session])

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!walletConnectCtx) return

        setLoading(true)
        const txId = await createStream()
        if (!txId) return
        const streamId = await getStreamIdFromTxId(txId)
        if (!streamId) return
        setLoading(false)
        history.push(`/stream/${streamId}`)
    }

    const createStream = async () => {
        if (!walletConnectCtx) return null

        const [senderAddress] = walletConnectCtx.accounts[0].split("@")

        // we are using GasToken contract, calling the 'transfer' method.
        // but we are transfering this gas to our smartcontract instead of a regular account
        // the GasToken will call our smartcontract's 'onNEP17Payment' method
        // the `args` variable represents the `data` parameter of 'onNEP17Payment'.
        const gasScriptHash = '0xd2a4cff31913016155e38e474a2c06d08be276cf'
        const contractScriptHash = DEFAULT_SC_SCRIPTHASH
        const from = {type: 'Address', value: senderAddress}
        const contract = {type: 'ScriptHash', value: contractScriptHash}
        const value = {type: 'Integer', value: totalAmountOfGas}

        const contractMethod = {type: 'String', value: 'createStream'}
        const to = {type: 'Address', value: recipientAddress}
        const startTime = {type: 'Integer', value: new Date(startDatetime).getTime() }
        const endTime = {type: 'Integer', value: new Date(endDatetime).getTime() }
        const args = {type: 'Array', value: [contractMethod, to, startTime, endTime]}

        const result = await walletConnectCtx.rpcRequest({
            method: 'invokefunction',
            params: [gasScriptHash, 'transfer', [from, contract, value, args]],
        })

        return result.result as string
    }

    const getStreamIdFromTxId = async (txId: string) => {
        const rpcClient = new rpc.RPCClient(DEFAULT_NEO_RPC_ADDRESS)

        // TODO: use Joe's websocket to create `await waitForTheNextBlock()` - http://54.227.25.52:9009/
        let appLog
        do {
            try {
                appLog = await rpcClient.getApplicationLog(txId)
            } catch (e) {
                await sleep(5000)
            }
        } while (!appLog)

        let streamId = null
        appLog.executions.forEach(e => {
            e.notifications.forEach(n => {
                if (n.eventname === 'StreamCreated') {
                    const hexstring = ((n.state.value as ContractParamJson[])[0].value as string)
                    const json = atob(hexstring)
                    const data = JSON.parse(json)
                    streamId = data.id
                }
            })
        })

        return streamId
    }

    const sleep = (time: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }

    return (
        <Flex as="form" onSubmit={handleSubmit} direction="column" align="center" flex="1" w="100%">
            {loading ? <><Spacer/><Spinner /><Spacer/></> : (<>
            <Text color="#004e87" fontWeight="bold" fontSize="2rem">Stream Registration</Text>
            <FormControl style={formControlStyle} isRequired>
                <FormLabel style={formLabelStyle}>Recipient Address</FormLabel>
                <Input
                    style={inputStyle}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}/>
            </FormControl>
            <FormControl style={formControlStyle} isRequired>
                <FormLabel style={formLabelStyle}>Total Amount of Gas</FormLabel>
                <NumberInput
                    value={totalAmountOfGas}
                    onChange={(value) => setTotalAmountOfGas(Number(value))}>
                    <NumberInputField style={inputStyle}/>
                    <NumberInputStepper>
                        <NumberIncrementStepper/>
                        <NumberDecrementStepper/>
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>
            <FormControl style={formControlStyle}>
                <FormLabel style={formLabelStyle}>Start Datetime</FormLabel>
                <Input
                    type="datetime-local"
                    style={inputStyle}
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}/>
            </FormControl>
            <FormControl style={formControlStyle} isRequired>
                <FormLabel style={formLabelStyle}>End Datetime</FormLabel>
                <Input
                    type="datetime-local"
                    style={inputStyle}
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}/>
            </FormControl>
            <Button type="submit" w="100%" maxWidth="35rem" backgroundColor="#0094ff" textColor="white" fontSize="2rem" h="4rem"
                    mb="2rem"
                    _hover={{backgroundColor: '#0081dc'}}>
                Create
            </Button>
            <Spacer/>
            </>)}
        </Flex>
    )
}