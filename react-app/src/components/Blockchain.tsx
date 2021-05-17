import React from "react";
import styled from "styled-components";
import {Flex, Image, Text} from "@chakra-ui/react";

interface AccountStyleProps {
    rgb: string;
}

const SAccount = styled.div<AccountStyleProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px;
  margin: 5px 0;
  border: ${({rgb}) => `2px solid rgb(${rgb})`};
  &.active {
    box-shadow: ${({rgb}) => `0 0 8px rgb(${rgb})`};
  }
`;

const SChain = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  & p {
    font-weight: 600;
  }
  & img {
    border-radius: 50%;
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
`;

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
