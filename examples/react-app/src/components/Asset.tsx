import * as React from "react";
import styled from "styled-components";

import { AssetData } from "../helpers";

const SAsset = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;
const SAssetLeft = styled.div`
  display: flex;
`;

const SAssetName = styled.div`
  display: flex;
  margin-left: 10px;
`;

const SAssetRight = styled.div`
  display: flex;
`;

const SAssetBalance = styled.div`
  display: flex;
`;

interface AssetProps {
  asset: AssetData;
}

const Asset = (props: AssetProps) => {
  const { asset } = props;
  return (
    <SAsset {...props}>
      <SAssetLeft>
        <SAssetName>{asset.name}</SAssetName>
      </SAssetLeft>
      <SAssetRight>
        <SAssetBalance>{`${asset.balance || "0"} ${asset.symbol}`}</SAssetBalance>
      </SAssetRight>
    </SAsset>
  );
};

export default Asset;
