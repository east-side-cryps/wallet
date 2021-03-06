import * as React from "react";
import styled from "styled-components";

import { ChainMetadata } from "../helpers";

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
  word-break: break-all;
  border: ${({ rgb }) => `2px solid rgb(${rgb})`};
  &.active {
    box-shadow: ${({ rgb }) => `0 0 8px rgb(${rgb})`};
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
  chainId: string;
  address?: string;
}

const Blockchain = (props: BlockchainProps) => {
  const { address } = props;
  const chainMeta: ChainMetadata = {
    name: 'Neo3',
    logo: 'https://cryptologos.cc/logos/neo-neo-logo.svg',
    rgb: '#00e599'
  }
  return (
    <React.Fragment>
      <SAccount rgb={chainMeta.rgb}>
        <SChain>
          <img src={chainMeta.logo} alt={chainMeta.name} />
          <p>{chainMeta.name}</p>
        </SChain>
        {address}
      </SAccount>
    </React.Fragment>
  );
};
export default Blockchain;
