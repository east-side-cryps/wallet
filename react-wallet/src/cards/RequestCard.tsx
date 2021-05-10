import * as React from "react";
import styled from "styled-components";
import { AppMetadata, SessionTypes } from "@walletconnect/types";

import Column from "../components/Column";
import Button from "../components/Button";
import Blockchain from "../components/Blockchain";
import Peer from "../components/Peer";
import {JsonRpcRequest} from "@json-rpc-tools/utils";

const SValue = styled.div`
  font-family: monospace;
  width: 100%;
  font-size: 12px;
  background-color: #eee;
  padding: 8px;
  word-break: break-word;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const SActions = styled.div`
  margin: 0;
  margin-top: 20px;

  display: flex;
  justify-content: space-around;
  & > * {
    margin: 0 5px;
  }
`;

interface RequestCardProps {
  chainId: string;
  requestEvent: SessionTypes.RequestEvent;
  metadata: AppMetadata;
  approveRequest: (requestEvent: SessionTypes.RequestEvent) => void;
  rejectRequest: (requestEvent: SessionTypes.RequestEvent) => void;
}

const getChainRequestRender = (request: JsonRpcRequest<any>) => {
    let params = [{ label: "Method", value: request.method }];

    request.params.forEach((p: any, i: number) => {
        if (typeof p !== 'object') {
            params.push({label: i.toString(10), value: p.toString()})
        } else {
            Object.keys(p).forEach((k: string) => {
                params.push({label: `${i}[${k}]`, value: p[k]})
            })
        }
    })
    return params;
}

const RequestCard = (props: RequestCardProps) => {
  const { chainId, requestEvent, metadata, approveRequest, rejectRequest } = props;
  const params = getChainRequestRender(requestEvent.request);

  return (
    <Column>
      <h6>{"App"}</h6>
      <Peer oneLiner metadata={metadata} />
      <h6>{"Chain"}</h6>
      <Blockchain key={`request:chain:${chainId}`} chainId={chainId} />
      {params.map(param => (
        <React.Fragment key={param.label}>
          <h6>{param.label}</h6>
          <SValue>{param.value}</SValue>
        </React.Fragment>
      ))}
      <SActions>
        <Button onClick={() => approveRequest(requestEvent)}>{`Approve`}</Button>
        <Button onClick={() => rejectRequest(requestEvent)}>{`Reject`}</Button>
      </SActions>
    </Column>
  );
};

export default RequestCard;
