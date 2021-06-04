import * as React from "react";
import * as ReactDOM from "react-dom";
import {ChakraProvider} from "@chakra-ui/react"
import {WalletConnectContextProvider} from "./context/WalletConnectContext";

import App from "./App";
import {AccountContextProvider} from "./context/AccountContext";

ReactDOM.render(
    <>
        <ChakraProvider>
            <WalletConnectContextProvider>
                <AccountContextProvider>
                    <App/>
                </AccountContextProvider>
            </WalletConnectContextProvider>
        </ChakraProvider>
    </>,
    document.getElementById("root"),
);
