import * as React from "react";
import styled from "styled-components";

import Client, { CLIENT_EVENTS } from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import { ERROR, getAppMetadata, getError } from "@walletconnect/utils";
import {ChakraProvider, Flex, IconButton, Link, Spacer, Text} from "@chakra-ui/react"
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
  DEFAULT_GASTOKEN_SCRIPTHASH,
  DEFAULT_TRANSFER_DESTINATION_ACCOUNT,
} from "./constants";
import {AccountAction} from "./helpers";
import { fonts } from "./styles";
import RequestModal from "./modals/RequestModal";
import PairingModal from "./modals/PairingModal";
import WaveIcon from "./components/icons/WaveIcon";
import RadioIcon from "./components/icons/RadioIcon";
import GHIcon from "./components/icons/GHIcon";

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

  public testGetAccountState = async () => {
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
          method: "getnep17balances",
          params: [DEFAULT_TRANSFER_DESTINATION_ACCOUNT],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "getnep17balances",
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

  public testGetVersion = async () => {
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
          method: "getversion",
          params: [],
        },
      });

      // format displayed result
      const formattedResult = {
        method: "getversion",
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

  public testInvokeFunctionUserBalanceOf = async () => {
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

      const scriptHash = DEFAULT_GASTOKEN_SCRIPTHASH
      const method = "balanceOf"
      const from = {type: "Address", value: address};

      const result = await this.state.client.request({
        topic: this.state.session.topic,
        chainId: DEFAULT_CHAIN_ID,
        request: {
          method: "invokefunction",
          params: [scriptHash, method, [from]],
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

      const scriptHash = DEFAULT_GASTOKEN_SCRIPTHASH
      const method = "transfer"
      const from = {type: "Address", value: address};
      const to = {type: "Address", value: DEFAULT_TRANSFER_DESTINATION_ACCOUNT};
      const value = {type: "Integer", value: 100000000};
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
      { method: "get version", callback: this.testGetVersion },
      { method: "nep17 balances of destination", callback: this.testGetAccountState },
      { method: "gas balance of user", callback: this.testInvokeFunctionUserBalanceOf },
      { method: "transfer", callback: this.testInvokeFunctionTransferGas },
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

  public render = () => {
    const { loading, session, modal } = this.state;
    return (
      <ChakraProvider>
        <Flex direction="column" width="100vw" minH="100vh">
          <Flex align="center" height="7rem" borderBottom="4px" borderColor="#0094FF" padding="3.2rem">
            <WaveIcon boxSize="3rem" mr="1rem" />
            <Text color="#004e87" fontSize="2.8rem" fontWeight="bold">GasStream.io</Text>
            <Spacer />
            <Link fontSize="1.125rem">Connect your Wallet</Link>
          </Flex>
          <Flex direction="column" flex={1} backgroundColor="#edf7ff" align="center" backgroundImage="url(/sea.svg)" backgroundPosition="bottom" backgroundRepeat="repeat-x">
            <Spacer />
            <Text maxW="40rem" fontSize="2rem" textAlign="center" fontWeight="bold">If you want to securely pay someone a little bit at a time, Gas Stream is for you</Text>
            <Spacer />
            <Flex align="center" borderRadius="8px" backgroundColor="#0094ff" padding="1rem 2rem">
              <RadioIcon boxSize="2.5rem" mr="1rem"/>
              <Text color="white" fontSize="2rem" m={0}>Create a Stream</Text>
            </Flex>
            <Spacer />
            <Spacer />
            <Flex align="center" backgroundColor="#004e87" padding="2rem 3.25rem" w="100%">
              <Text margin={0} color="white">Gas Stream was created by <Link color="#0094ff">@hal0x2823</Link>, <Link color="#0094ff">@melanke</Link> and <Link color="#0094ff">@yumiuehara</Link></Text>
              <Spacer />
              <Link color="white" margin={0}>
                <Flex align="center">
                  <GHIcon boxSize="1.5rem" mr="0.5rem"/>
                  <Text fontSize="1.125rem" margin={0}>Fork it on Github</Text>
                </Flex>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </ChakraProvider>
    );
  };
}

export default App;
