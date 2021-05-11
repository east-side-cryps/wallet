import * as React from "react";
import styled from "styled-components";

import Client, { CLIENT_EVENTS } from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import { ERROR, getAppMetadata, getError } from "@walletconnect/utils";
import Blockchain from "./components/Blockchain";
import Button from "./components/Button";
import Column from "./components/Column";
import Header from "./components/Header";
import Modal from "./components/Modal";
import Wrapper from "./components/Wrapper";
import {
  DEFAULT_APP_METADATA,
  DEFAULT_LOGGER,
  DEFAULT_METHODS,
  DEFAULT_RELAY_PROVIDER,
  DEFAULT_CHAIN_ID,
} from "./constants";
import {
  apiGetAccountAssets,
  AccountAction,
  AccountBalances,
} from "./helpers";
import { fonts } from "./styles";
import RequestModal from "./modals/RequestModal";
import PairingModal from "./modals/PairingModal";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper as any)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  /* height: 600px; */
`;

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  margin: 12px 0;
`;

const SAccountsContainer = styled(SLanding as any)`
  height: 100%;
  padding-bottom: 30px;
  & h3 {
    padding-top: 30px;
  }
`;

const SFullWidthContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const SAccounts = styled(SFullWidthContainer)`
  justify-content: space-between;
  & > div {
    margin: 12px 0;
    flex: 1 0 100%;
    @media (min-width: 648px) {
      flex: 0 1 48%;
    }
  }
`;

interface AppState {
  client: Client | undefined;
  session: SessionTypes.Created | undefined;
  testNet: boolean;
  loading: boolean;
  fetching: boolean;
  pairings: string[];
  modal: string;
  pending: boolean;
  uri: string;
  accounts: string[]; // addresses
  result: any | undefined;
  balances: AccountBalances;
}

const INITIAL_STATE: AppState = {
  client: undefined,
  session: undefined,
  testNet: true,
  loading: false,
  fetching: false,
  pairings: [],
  modal: "",
  pending: false,
  uri: "",
  accounts: [],
  result: undefined,
  balances: {},
};

class App extends React.Component<any, any> {
  public state: AppState = {
    ...INITIAL_STATE,
  };
  public componentDidMount() {
    this.init();
  }

  public init = async () => {
    this.setState({ loading: true });

    try {
      const client = await Client.init({
        logger: DEFAULT_LOGGER,
        relayProvider: DEFAULT_RELAY_PROVIDER,
      });

      this.setState({ loading: false, client });
      this.subscribeToEvents();
      await this.checkPersistedState();
    } catch (e) {
      this.setState({ loading: false });
      throw e;
    }
  };

  public subscribeToEvents = () => {
    if (typeof this.state.client === "undefined") {
      return;
    }

    this.state.client.on(
      CLIENT_EVENTS.pairing.proposal,
      async (proposal: PairingTypes.Proposal) => {
        const { uri } = proposal.signal.params;
        this.setState({ uri });
        QRCodeModal.open(uri, () => {
          console.log("Modal callback");
        });
      },
    );

    this.state.client.on(CLIENT_EVENTS.pairing.created, async (proposal: PairingTypes.Settled) => {
      if (typeof this.state.client === "undefined") return;
      this.setState({ pairings: this.state.client.pairing.topics });
    });

    this.state.client.on(CLIENT_EVENTS.session.deleted, (session: SessionTypes.Settled) => {
      if (session.topic !== this.state.session?.topic) return;
      console.log("EVENT", "session_deleted");
      this.resetApp();
    });
  };

  public checkPersistedState = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    // populates existing pairings to state
    this.setState({ pairings: this.state.client.pairing.topics });
    if (typeof this.state.session !== "undefined") return;
    // populates existing session to state (assume only the top one)
    if (this.state.client.session.topics.length) {
      const session = await this.state.client.session.get(this.state.client.session.topics[0]);
      this.setState({ accounts: session.state.accounts });
      this.onSessionConnected(session);
    }
  };

  public connect = async (pairing?: { topic: string }) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    console.log("connect", pairing);
    if (this.state.modal === "pairing") {
      this.closeModal();
    }
    try {
      const session = await this.state.client.connect({
        metadata: getAppMetadata() || DEFAULT_APP_METADATA,
        pairing,
        permissions: {
          blockchain: {
            chains: [DEFAULT_CHAIN_ID],
          },
          jsonrpc: {
            methods: DEFAULT_METHODS,
          },
        },
      });

      this.onSessionConnected(session);
    } catch (e) {
      // ignore rejection
    }

    // close modal in case it was open
    QRCodeModal.close();
  };

  public disconnect = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not connected");
    }
    await this.state.client.disconnect({
      topic: this.state.session.topic,
      reason: getError(ERROR.USER_DISCONNECTED),
    });
  };

  public resetApp = async () => {
    const { client } = this.state;
    this.setState({ ...INITIAL_STATE, client });
  };

  public onSessionConnected = async (session: SessionTypes.Settled) => {
    this.setState({ session });
    this.onSessionUpdate(session.state.accounts);
  };

  public onSessionUpdate = async (accounts: string[]) => {
    this.setState({ accounts });
    await this.getAccountBalances();
  };

  public getAccountBalances = async () => {
    this.setState({ fetching: true });
    try {
      const arr = await Promise.all(
        this.state.accounts.map(async account => {
          const [address] = account.split("@");
          const assets = await apiGetAccountAssets(address);
          return { account, assets };
        }),
      );

      const balances: AccountBalances = {};
      arr.forEach(({ account, assets }) => {
        balances[account] = assets;
      });
      this.setState({ fetching: false, balances });
    } catch (error) {
      console.error(error);
      this.setState({ fetching: false });
    }
  };

  public openPairingModal = () => this.setState({ modal: "pairing" });

  public openRequestModal = () => this.setState({ pending: true, modal: "request" });

  public openModal = (modal: string) => this.setState({ modal });

  public closeModal = () => this.setState({ modal: "" });

  public onConnect = () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (this.state.client.pairing.topics.length) {
      return this.openPairingModal();
    }
    this.connect();
  };

  public testGetBestBlockHash = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      const account = this.state.accounts[0]
      const [address] = account.split("@")

      // open modal
      this.openRequestModal();

      const result = await this.state.client.request({
        topic: this.state.session.topic,
        chainId: DEFAULT_CHAIN_ID,
        request: {
          method: "getbestblockhash",
          params: [],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "getbestblockhash",
        address,
        result,
      };

      // display result
      this.setState({ pending: false, result: formattedResult || null });
    } catch (error) {
      console.error(error);
      this.setState({ pending: false, result: null });
    }
  };

  public testInvokeFunctionHello = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      const account = this.state.accounts[0]
      const [address] = account.split("@")

      // open modal
      this.openRequestModal();

      const scriptHash = "0xa4c049bb63f33bc268b4aa0384d1de56de8d9894"
      const method = "hello"

      const result = await this.state.client.request({
        topic: this.state.session.topic,
        chainId: DEFAULT_CHAIN_ID,
        request: {
          method: "invokefunction",
          params: [scriptHash, method],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "invokefunction",
        address,
        result,
      };

      // display result
      this.setState({ pending: false, result: formattedResult || null });
    } catch (error) {
      console.error(error);
      this.setState({ pending: false, result: null });
    }
  };

  public testInvokeFunctionBalanceOfGas = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      const account = this.state.accounts[0]
      const [address] = account.split("@")

      // open modal
      this.openRequestModal();

      const scriptHash = "0xd2a4cff31913016155e38e474a2c06d08be276cf"
      const method = "balanceOf"
      const addressParam = {type: "Address", value: address};

      const result = await this.state.client.request({
        topic: this.state.session.topic,
        chainId: DEFAULT_CHAIN_ID,
        request: {
          method: "invokefunction",
          params: [scriptHash, method, [addressParam]],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "invokefunction",
        address,
        result,
      };

      // display result
      this.setState({ pending: false, result: formattedResult || null });
    } catch (error) {
      console.error(error);
      this.setState({ pending: false, result: null });
    }
  };

  public testInvokeFunctionTransferGas = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      const account = this.state.accounts[0]
      const [address] = account.split("@")

      // open modal
      this.openRequestModal();

      const scriptHash = "0xd2a4cff31913016155e38e474a2c06d08be276cf"
      const method = "transfer"
      const from = {type: "Address", value: address};
      const to = {type: "Address", value: "NRnvbghHXdJkcMx9BHPqFeSjjGu4UriJ8Z"};
      const value = {type: "Integer", value: 1};
      const data = {type: "String", value: ""}

      const result = await this.state.client.request({
        topic: this.state.session.topic,
        chainId: DEFAULT_CHAIN_ID,
        request: {
          method: "invokefunction",
          params: [scriptHash, method, [from, to, value, data]],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "invokefunction",
        address,
        result,
      };

      // display result
      this.setState({ pending: false, result: formattedResult || null });
    } catch (error) {
      console.error(error);
      this.setState({ pending: false, result: null });
    }
  };

  public getNeoActions = (): AccountAction[] => {
    return [
      { method: "getbestblockhash", callback: this.testGetBestBlockHash },
      { method: "invokefunction hello", callback: this.testInvokeFunctionHello },
      { method: "invokefunction balanceOf", callback: this.testInvokeFunctionBalanceOfGas },
      { method: "invokefunction transfer", callback: this.testInvokeFunctionTransferGas },
    ];
  };

  public renderModal = () => {
    switch (this.state.modal) {
      case "pairing":
        if (typeof this.state.client === "undefined") {
          throw new Error("WalletConnect is not initialized");
        }
        return <PairingModal pairings={this.state.client.pairing.values} connect={this.connect} />;
      case "request":
        return <RequestModal pending={this.state.pending} result={this.state.result} />;
      default:
        return null;
    }
  };

  public renderContent = () => {
    const { balances, accounts, fetching } = this.state;
    return !accounts.length && !Object.keys(balances).length ? (
      <SLanding center>
        <SConnectButton
          left
          onClick={this.onConnect}
          fetching={fetching}
        >
          {"Connect"}
        </SConnectButton>
      </SLanding>
    ) : (
      <SAccountsContainer>
        <h3>Accounts</h3>
        <SAccounts>
          {this.state.accounts.map(account => {
            const [address] = account.split("@");
            return (
              <Blockchain
                key={account}
                active={true}
                fetching={fetching}
                address={address}
                balances={balances}
                actions={this.getNeoActions()}
              />
            );
          })}
        </SAccounts>
      </SAccountsContainer>
    );
  };

  public render = () => {
    const { loading, session, modal } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header disconnect={this.disconnect} session={session} />
          <SContent>{loading ? "Loading..." : this.renderContent()}</SContent>
        </Column>
        <Modal show={!!modal} closeModal={this.closeModal}>
          {this.renderModal()}
        </Modal>
      </SLayout>
    );
  };
}

export default App;
