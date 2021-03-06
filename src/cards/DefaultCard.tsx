import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";
import { isJsonRpcRequest } from "@json-rpc-tools/utils";

import Input from "../components/Input";
import Button from "../components/Button";
import Column from "../components/Column";
import Blockchain from "../components/Blockchain";
import PulsingMethod from "../components/PulsingMethod";

const SSection = styled.div`
  width: 100%;
  position: relative;
`;

const SSession = styled.div`
  display: flex;
  align-items: center;
  & img {
    width: 40px;
    height: 40px;
  }
  & > div {
    margin-left: 10px;
  }
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

const SActionsColumn = styled(SActions as any)`
  flex-direction: row;
  align-items: center;

  margin: 24px 0 6px;

  & > p {
    font-weight: 600;
  }
`;

const SButton = styled(Button)`
  width: 50%;
  height: 40px;
`;

const SInput = styled(Input)`
  width: 50%;
  margin: 10px;
  font-size: 14px;
  height: 40px;
`;

interface DefaultCardProps {
  accounts: string[];
  sessions: SessionTypes.Created[];
  requests: SessionTypes.RequestEvent[];
  openSession: (session: SessionTypes.Created) => void;
  openRequest: (requestEvent: SessionTypes.RequestEvent) => Promise<void>;
  openScanner: () => void;
  exportAccount: () => void;
  logout: () => void;
  onURI: (data: any) => void;
}

const DefaultCard = (props: DefaultCardProps) => {
  const {
    accounts,
    sessions,
    requests,
    openSession,
    openRequest,
    openScanner,
    exportAccount,
    logout,
    onURI,
  } = props;
  return (
    <Column>
      <SSection>
        {!!accounts.length ? (
          <React.Fragment>
            <h6>{"Accounts"}</h6>
            {accounts.map(account => {
              const [address, chainId] = account.split("@");
              return (
                <>
                  <Blockchain
                    key={`default:account:${account}`}
                    chainId={chainId}
                    address={address}
                  />
                  <SButton onClick={exportAccount}>{`Export`}</SButton>
                  <SButton onClick={logout}>{`Logout`}</SButton>
                </>
              );
            })}
          </React.Fragment>
        ) : null}
        {!!sessions.length ? (
          <React.Fragment>
            <h6>{"Sessions"}</h6>
            {sessions.map(session => (
              <SSession key={session.topic} onClick={() => openSession(session)}>
                <img src={session.peer.metadata.icons[0]} alt={session.peer.metadata.name} />
                <div>{session.peer.metadata.name}</div>
              </SSession>
            ))}
            {requests.length ? (
              <React.Fragment>
                <h6>{"Requests"}</h6>
                {requests.map(requestEvent =>
                  isJsonRpcRequest(requestEvent.request) ? (
                    <PulsingMethod
                      key={`default:request:${requestEvent.request.id}`}
                      onClick={() => openRequest(requestEvent)}
                    >
                      <div>{requestEvent.request.method}</div>
                    </PulsingMethod>
                  ) : null,
                )}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h6>{"Requests"}</h6>
                <div>{"No pending requests"}</div>
              </React.Fragment>
            )}
          </React.Fragment>
        ) : null}
      </SSection>

      <SActionsColumn>
        <SButton onClick={openScanner}>{`Scan`}</SButton>
        <p>{"OR"}</p>
        <SInput onChange={(e: any) => onURI(e.target.value)} placeholder={"Paste wc: uri"} />
      </SActionsColumn>
    </Column>
  );
};
export default DefaultCard;
