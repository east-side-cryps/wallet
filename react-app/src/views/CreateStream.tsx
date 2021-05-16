import React, {useState} from "react";
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
    FormLabel, Button
} from "@chakra-ui/react";
import {useWalletConnect} from "../context/WalletConnectContext";
import {stringify} from "querystring";

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

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!walletConnectCtx) return

        const [senderAddress] = walletConnectCtx.accounts[0].split("@")

        const gasScriptHash = '0xd2a4cff31913016155e38e474a2c06d08be276cf'
        const contractScriptHash = '0x92ad91bf49a0b5916a7edeff132dce91dc58a3c1'
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

        // TODO: wait for next block and retrieve the last submitted stream and redirect to it's detail page
        alert(JSON.stringify(result, null, 2))
    }

    return (
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
            <Flex direction="column" align="center">
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
            </Flex>
        </form>
    )
}