import * as React from "react";

import Loader from "../components/Loader";
import { SContainer, STable, SRow, SKey, SValue } from "../components/shared";

import { SModalContainer, SModalTitle, SModalParagraph } from "./shared";

interface RequestModalProps {
  pending: boolean;
  result: any;
}

const formatResultValue = (value: any) => {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  } else {
    return value.toString()
  }
}

const RequestModal = (props: RequestModalProps) => {
  const { pending, result } = props;
  return (
    <>
      {pending ? (
        <SModalContainer>
          <SModalTitle>{"Pending JSON-RPC Request"}</SModalTitle>
          <SContainer>
            <Loader />
            <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
          </SContainer>
        </SModalContainer>
      ) : result ? (
        <SModalContainer>
          <SModalTitle>
            {result.valid !== false ? "JSON-RPC Request Approved" : "JSON-RPC Request Failed"}
          </SModalTitle>
          <STable>
            {Object.keys(result).map(key => (
              <SRow key={key}>
                <SKey>{key}</SKey>
                <SValue>{formatResultValue(result[key])}</SValue>
              </SRow>
            ))}
          </STable>
        </SModalContainer>
      ) : (
        <SModalContainer>
          <SModalTitle>{"JSON-RPC Request Rejected"}</SModalTitle>
        </SModalContainer>
      )}
    </>
  );
};

export default RequestModal;
