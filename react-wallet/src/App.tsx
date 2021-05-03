import * as React from "react";
import styled from "styled-components";
import KeyValueStorage from "keyvaluestorage";
import Client, { CLIENT_EVENTS } from "@walletconnect/client";
import {JsonRpcResponse, formatJsonRpcError, JsonRpcRequest} from "@json-rpc-tools/utils";
import { ERROR, getAppMetadata, getError } from "@walletconnect/utils";
import { SessionTypes } from "@walletconnect/types";

import Card from "./components/Card";
import Scanner, { ScannerValidation } from "./components/Scanner";

import DefaultCard from "./cards/DefaultCard";
import RequestCard from "./cards/RequestCard";
import ProposalCard from "./cards/ProposalCard";
import SessionCard from "./cards/SessionCard";
import SettingsCard from "./cards/SettingsCard";

import {
  DEFAULT_APP_METADATA,
  DEFAULT_CHAIN_ID,
  DEFAULT_LOGGER,
  DEFAULT_METHODS,
  DEFAULT_RELAY_PROVIDER,
} from "./constants";
import { Cards, isProposalCard, isRequestCard, isSessionCard, isSettingsCard } from "./helpers";
import {wallet} from "@cityofzion/neon-js";
import {AccountJSON} from "@cityofzion/neon-core/lib/wallet/Account";

const SContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  min-height: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
`;

const SVersionNumber = styled.div`
  position: absolute;
  font-size: 12px;
  bottom: 6%;
  right: 0;
  opacity: 0.3;
  transform: rotate(-90deg);
`;

const SContent = styled.div`
  width: 100%;
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export interface AppState {
  client: Client | undefined;
  storage: KeyValueStorage | undefined;
  loading: boolean;
  scanner: boolean;
  chains: string[];
  accounts: string[];
  sessions: SessionTypes.Created[];
  requests: SessionTypes.RequestEvent[];
  results: any[];
  card: Cards.All;
}

export const INITIAL_STATE: AppState = {
  client: undefined,
  storage: undefined,
  loading: false,
  scanner: false,
  chains: [DEFAULT_CHAIN_ID],
  accounts: [],
  sessions: [],
  requests: [],
  results: [],
  card: { type: "default", data: {} },
};

class App extends React.Component<{}> {
  public state: AppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
  }
  public componentDidMount() {
    this.init().then(() => {});
  }

  public init = async () => {
    this.setState({ loading: true });
    try {
      const storage = new KeyValueStorage();
      const client = await Client.init({
        controller: true,
        relayProvider: DEFAULT_RELAY_PROVIDER,
        logger: DEFAULT_LOGGER,
        storage,
      });
      const accounts = await this.getAccounts(storage)
      this.setState({ loading: false, storage, client, accounts });
      this.subscribeToEvents();
      await this.checkPersistedState();
    } catch (e) {
      this.setState({ loading: false });
      throw e;
    }
  };

  public getAccounts = async (storage: KeyValueStorage) => {
    const json = await storage.getItem<Partial<AccountJSON>>("account")
    const account = new wallet.Account(json)
    if (!json) {
      await account.encrypt("mypassword")
      await storage.setItem("account", account.export())
    }
    return [`${account.address}@${DEFAULT_CHAIN_ID}`]
  }

  public resetApp = async () => {
    this.setState({ ...INITIAL_STATE });
  };

  public subscribeToEvents = () => {
    console.log("ACTION", "subscribeToEvents");

    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }

    this.state.client.on(CLIENT_EVENTS.session.proposal, (proposal: SessionTypes.Proposal) => {
      if (typeof this.state.client === "undefined") {
        throw new Error("Client is not initialized");
      }
      console.log("EVENT", "session_proposal");
      const unsupportedChains = [];
      proposal.permissions.blockchain.chains.forEach(chainId => {
        if (this.state.chains.includes(chainId)) return;
        unsupportedChains.push(chainId);
      });
      if (unsupportedChains.length) {
        return this.state.client.reject({ proposal });
      }
      const unsupportedMethods = [];
      proposal.permissions.jsonrpc.methods.forEach(method => {
        if (DEFAULT_METHODS.includes(method)) return;
        unsupportedMethods.push(method);
      });
      if (unsupportedMethods.length) {
        return this.state.client.reject({ proposal });
      }
      this.openProposal(proposal);
    });

    this.state.client.on(
      CLIENT_EVENTS.session.request,
      async (requestEvent: SessionTypes.RequestEvent) => {
        // tslint:disable-next-line
        console.log("EVENT", CLIENT_EVENTS.session.request, requestEvent.request);
        try {
          const alreadyApproved = await this.checkApprovedRequest(requestEvent.request);
          if (!alreadyApproved) {
            this.setState({ requests: [...this.state.requests, requestEvent] });
          } else {
            const response = await this.makeRequest(requestEvent.request)
            await this.respondRequest(requestEvent.topic, response);
          }
        } catch (e) {
          const response = formatJsonRpcError(requestEvent.request.id, e.message);
          await this.respondRequest(requestEvent.topic, response);
        }
      },
    );

    this.state.client.on(CLIENT_EVENTS.session.created, () => {
      if (typeof this.state.client === "undefined") {
        throw new Error("Client is not initialized");
      }
      console.log("EVENT", "session_created");
      this.setState({ sessions: this.state.client.session.values });
    });

    this.state.client.on(CLIENT_EVENTS.session.deleted, () => {
      if (typeof this.state.client === "undefined") {
        throw new Error("Client is not initialized");
      }
      console.log("EVENT", "session_deleted");
      this.setState({ sessions: this.state.client.session.values });
    });
  };

  public checkPersistedState = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    const requests = this.state.client.session.history.pending;
    const sessions = this.state.client.session.values;
    this.setState({ sessions, requests });
  };

  // ---- MAKE REQUESTS AND SAVE/CHECK IF APPROVED ------------------------------//

  public approveAndMakeRequest = async (request: JsonRpcRequest) => {
    this.state.storage?.setItem(`request-${JSON.stringify(request)}`, true)
    return await this.makeRequest(request)
  }

  public makeRequest = async (request: JsonRpcRequest) => {
    // TODO: make the blockchain request
    return { // await this.state.wallet.resolve(requestEvent.request, chainId);
      id: 1,
      jsonrpc: '',
      result: null,
    }
  }

  public checkApprovedRequest = async (request: JsonRpcRequest) => {
    return await this.state.storage?.getItem<boolean>(`request-${JSON.stringify(request)}`)
  }

  // ---- Scanner --------------------------------------------------------------//

  public openScanner = () => {
    console.log("ACTION", "openScanner");
    this.setState({ scanner: true });
  };

  public closeScanner = () => {
    console.log("ACTION", "closeScanner");
    this.setState({ scanner: false });
  };

  public onScannerValidate = (data: string) => {
    const res: ScannerValidation = { error: null, result: null };
    try {
      res.result = data;
    } catch (error) {
      res.error = error;
    }

    return res;
  };

  public onScannerScan = async (data: any) => {
    await this.onURI(data);
    this.closeScanner();
  };

  public onScannerError = (error: Error) => {
    throw error;
  };

  public onScannerClose = () => this.closeScanner();

  public onURI = async (data: any) => {
    const uri = typeof data === "string" ? data : "";
    if (!uri) return;
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    await this.state.client.pair({ uri });
  };

  // ---- Cards --------------------------------------------------------------//

  public openCard = (card: Cards.All) => this.setState({ card });

  public resetCard = () => this.setState({ card: INITIAL_STATE.card });

  public openProposal = (proposal: SessionTypes.Proposal) =>
    this.openCard({ type: "proposal", data: { proposal } });

  public openSession = (session: SessionTypes.Created) =>
    this.openCard({ type: "session", data: { session } });

  public openRequest = async (requestEvent: SessionTypes.RequestEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    const { peer } = await this.state.client.session.get(requestEvent.topic);
    this.openCard({ type: "request", data: { requestEvent, peer } });
  };

  // ---- Session --------------------------------------------------------------//

  public approveSession = async (proposal: SessionTypes.Proposal) => {
    console.log("ACTION", "approveSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    if (typeof this.state.accounts === "undefined") {
      throw new Error("Accounts is undefined");
    }
    const accounts = this.state.accounts.filter(account => {
      const chainId = account.split("@")[1];
      return proposal.permissions.blockchain.chains.includes(chainId);
    });
    const response = {
      state: { accounts },
      metadata: getAppMetadata() || DEFAULT_APP_METADATA,
    };
    const session = await this.state.client.approve({ proposal, response });
    this.resetCard();
    this.setState({ session });
  };

  public rejectSession = async (proposal: SessionTypes.Proposal) => {
    console.log("ACTION", "rejectSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    await this.state.client.reject({ proposal });
    this.resetCard();
  };

  public disconnect = async (topic: string) => {
    console.log("ACTION", "disconnect");
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    await this.state.client.disconnect({
      topic,
      reason: getError(ERROR.USER_DISCONNECTED),
    });
    await this.resetCard();
  };

  // ---- Requests --------------------------------------------------------------//

  public removeFromPending = async (requestEvent: SessionTypes.RequestEvent) => {
    this.setState({
      requests: this.state.requests.filter(x => x.request.id !== requestEvent.request.id),
    });
  };

  public respondRequest = async (topic: string, response: JsonRpcResponse) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    await this.state.client.respond({ topic, response });
  };

  public approveRequest = async (requestEvent: SessionTypes.RequestEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    try {
      const response = await this.approveAndMakeRequest(requestEvent.request)
      await this.state.client.respond({
        topic: requestEvent.topic,
        response,
      });
    } catch (error) {
      console.error(error);
      await this.state.client.respond({
        topic: requestEvent.topic,
        response: formatJsonRpcError(requestEvent.request.id, "Failed or Rejected Request"),
      });
    }

    await this.removeFromPending(requestEvent);
    await this.resetCard();
  };

  public rejectRequest = async (requestEvent: SessionTypes.RequestEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("Client is not initialized");
    }
    await this.state.client.respond({
      topic: requestEvent.topic,
      response: formatJsonRpcError(requestEvent.request.id, "Failed or Rejected Request"),
    });
    await this.removeFromPending(requestEvent);
    await this.resetCard();
  };

  // ---- Render --------------------------------------------------------------//

  public renderCard = () => {
    const { accounts, sessions, chains, requests, card } = this.state;
    let content: JSX.Element | undefined;
    if (isProposalCard(card)) {
      const { proposal } = card.data;
      content = (
        <ProposalCard
          proposal={proposal}
          approveSession={this.approveSession}
          rejectSession={this.rejectSession}
        />
      );
    } else if (isRequestCard(card)) {
      const { requestEvent, peer } = card.data;
      content = (
        <RequestCard
          chainId={requestEvent.chainId || chains[0]}
          requestEvent={requestEvent}
          metadata={peer.metadata}
          approveRequest={this.approveRequest}
          rejectRequest={this.rejectRequest}
        />
      );
    } else if (isSessionCard(card)) {
      const { session } = card.data;
      content = (
        <SessionCard session={session} resetCard={this.resetCard} disconnect={this.disconnect} />
      );
    } else if (isSettingsCard(card)) {
      const { mnemonic, chains } = card.data;
      content = <SettingsCard mnemonic={mnemonic} chains={chains} resetCard={this.resetCard} />;
    } else {
      content = (
        <DefaultCard
          accounts={accounts}
          sessions={sessions}
          requests={requests}
          openSession={this.openSession}
          openRequest={this.openRequest}
          openScanner={this.openScanner}
          onURI={this.onURI}
        />
      );
    }
    return <Card>{content}</Card>;
  };

  public render() {
    const { loading, scanner } = this.state;
    return (
      <React.Fragment>
        <SContainer>
          <SContent>{loading ? "Loading..." : this.renderCard()}</SContent>
          {scanner && (
            <Scanner
              onValidate={this.onScannerValidate}
              onScan={this.onScannerScan}
              onError={this.onScannerError}
              onClose={this.onScannerClose}
            />
          )}
        </SContainer>
        <SVersionNumber>{`v${process.env.REACT_APP_VERSION || "2.0.0-alpha"}`}</SVersionNumber>
      </React.Fragment>
    );
  }
}

export default App;
