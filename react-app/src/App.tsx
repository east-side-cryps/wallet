import * as React from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom"
import {
    ChakraProvider, Flex, Link, Spacer, Text
} from "@chakra-ui/react"
import GHIcon from "./components/icons/GHIcon"
import Home from "./views/Home"
import {WalletConnectContextProvider} from "./context/WalletConnectContext";
import Header from "./components/Header";
import ModalRouter from "./components/ModalRouter";
import ConnectToProceed from "./views/ConnectToProceed";
import CreateStream from "./views/CreateStream";
import StreamDetails from "./views/StreamDetails";

export default function App() {
    return (
        <ChakraProvider>
            <WalletConnectContextProvider>
                <Router>
                    <Flex direction="column" w="100vw" minH="100vh">
                        <Header />
                        <Flex direction="column" flex={1} backgroundColor="#edf7ff" align="center"
                              backgroundImage="url(/sea.svg)" backgroundPosition="bottom" backgroundRepeat="repeat-x">

                            <Switch>
                                <Route path="/connectToProceed">
                                    <ConnectToProceed/>
                                </Route>
                                <Route path="/createStream">
                                    <CreateStream/>
                                </Route>
                                <Route path="/stream/:id">
                                    <StreamDetails/>
                                </Route>
                                <Route path="/">
                                    <Home/>
                                </Route>
                            </Switch>

                            <Flex align="center" backgroundColor="#004e87" p={["1rem", "2rem 3.25rem"]} w="100%">
                                <Text m={0} color="white">
                                    Gas Stream was created
                                    by <Link color="#0094ff">@hal0x2823</Link>, <Link
                                    color="#0094ff">@melanke</Link> and <Link color="#0094ff">@yumiuehara</Link>
                                </Text>
                                <Spacer/>
                                <Link color="white" m={0}>
                                    <Flex align="center">
                                        <GHIcon boxSize="1.5rem" mr="0.5rem"/>
                                        <Text fontSize="1.125rem" m={0}>Fork it on Github</Text>
                                    </Flex>
                                </Link>
                            </Flex>
                        </Flex>
                    </Flex>
                    <ModalRouter />
                </Router>
            </WalletConnectContextProvider>
        </ChakraProvider>
    )
}
