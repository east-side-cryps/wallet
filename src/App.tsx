import * as React from "react";
import Card from "./components/Card";
import Scanner from "./components/Scanner";
import DefaultCard from "./cards/DefaultCard";
import RequestCard from "./cards/RequestCard";
import ProposalCard from "./cards/ProposalCard";
import SessionCard from "./cards/SessionCard";
import {useWalletConnect} from "./context/WalletConnectContext";
import {Flex} from "@chakra-ui/react";
import Header from "./components/Header";
import {useAccountContext} from "./context/AccountContext";
import AccountEntry from "./components/AccountEntry";
import {Step} from "./helpers";

export default function App() {
    const walletConnectCtx = useWalletConnect()
    const accountCtx = useAccountContext()

    const isProposalStep = (card: Step.All): card is Step.Proposal => {
        return card.type === "proposal";
    }

    const isSessionStep = (card: Step.All): card is Step.Session => {
        return card.type === "session";
    }

    const isRequestStep = (card: Step.All): card is Step.Request => {
        return card.type === "request";
    }

    const renderCard = () => {
        let content: JSX.Element | undefined;
        if (isProposalStep(walletConnectCtx.step)) {
            const {proposal} = walletConnectCtx.step.data;
            content = (
                <ProposalCard
                    proposal={proposal}
                    approveSession={walletConnectCtx.approveSession}
                    rejectSession={walletConnectCtx.rejectSession}
                />
            );
        } else if (isRequestStep(walletConnectCtx.step)) {
            const {requestEvent, peer} = walletConnectCtx.step.data;
            content = (
                <RequestCard
                    chainId={requestEvent.chainId || walletConnectCtx.chains[0]}
                    requestEvent={requestEvent}
                    metadata={peer.metadata}
                    approveRequest={walletConnectCtx.approveRequest}
                    rejectRequest={walletConnectCtx.rejectRequest}
                />
            );
        } else if (isSessionStep(walletConnectCtx.step)) {
            const {session} = walletConnectCtx.step.data;
            content = (
                <SessionCard session={session} resetCard={walletConnectCtx.resetStep} disconnect={walletConnectCtx.disconnect}/>
            );
        } else {
            content = (
                <DefaultCard
                    accounts={walletConnectCtx.accountsAsString(walletConnectCtx.accounts)}
                    sessions={walletConnectCtx.sessions}
                    requests={walletConnectCtx.requests}
                    openSession={walletConnectCtx.openSession}
                    openRequest={walletConnectCtx.openRequest}
                    openScanner={walletConnectCtx.openScanner}
                    onURI={walletConnectCtx.onURI}
                />
            );
        }
        return <Card>{content}</Card>;
    };

    return (
        <Flex direction="column" w="100vw" minH="100vh" bgImage="url(/bg.png)" color="white">
            <Header/>
            {!walletConnectCtx.accounts.length || !accountCtx.accountDecripted
                ? (<AccountEntry flex={1} />)
                : (
                    <>
                        {walletConnectCtx.loading ? "Loading..." : renderCard()}
                        {walletConnectCtx.scanner && (
                            <Scanner
                                onValidate={walletConnectCtx.onScannerValidate}
                                onScan={walletConnectCtx.onScannerScan}
                                onError={walletConnectCtx.onScannerError}
                                onClose={walletConnectCtx.closeScanner}
                            />
                        )}
                    </>
                )}
        </Flex>
    );
}