import React from "react";
import styled from "styled-components";
import {Flex, Image, Text} from "@chakra-ui/react";

interface AccountStyleProps {
    rgb: string;
}

interface BlockchainProps {
    address?: string;
    onClick?: () => void;
}

export default function Blockchain(props: BlockchainProps) {
    const {address, onClick} = props;
    const chainMeta = {
        name: 'Neo3',
        logo: 'https://cryptologos.cc/logos/neo-neo-logo.svg',
    }

    const ellipseAddress = (address = "", width = 10) => {
        return `${address.slice(0, width)}...${address.slice(-width)}`;
    }

    return (
        <Flex
            onClick={() => onClick && onClick()}
        >
            <Image src={chainMeta.logo} alt={chainMeta.name} w="2rem" mr="0.5rem" />
            <Flex direction="column">
                <Text fontWeight="bold" fontSize="0.8rem">{chainMeta.name}</Text>
                <Text fontSize="0.8rem">{ellipseAddress(address, 6)}</Text>
            </Flex>
        </Flex>
    )
}
