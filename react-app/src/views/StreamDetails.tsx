import {Link, Spacer, Spinner, Text} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Neon, {sc} from "@cityofzion/neon-js";
import {DEFAULT_NEO_NETWORK_MAGIC, DEFAULT_NEO_RPC_ADDRESS, DEFAULT_SC_SCRIPTHASH} from "../constants";

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
    let {id} = useParams<{id: string}>();
    const [loading, setLoading] = useState(true)
    const [stream, setStream] = useState<Stream | undefined>(undefined)

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

    return (<>
        {loading ? <><Spacer/><Spinner /><Spacer/></> : (<>
            <Spacer/>
            <Text color="#004e87" fontSize={["1.4rem", "2rem"]} textAlign="center" m="0.5rem">
                {id}
            </Text>
            <Spacer/>
            <Spacer/>
        </>)}
    </>)
}