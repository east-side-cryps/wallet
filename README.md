# WalletConnect Proof of Concept
The purpose of this repository is to test the functionalities around WalletConnect integration and be an implementation reference for future development.

[Demo Video](https://streamable.com/tf15wf)

## How does it work?
On this POC we have 2 applications:
- `react-app`: Is the Dapp that wants to connect to a Wallet via WalletConnect to perform blockchain signed transactions
- `react-wallet`: Is the Wallet that wants to allow such connections

With both using WalletConnect client library they are able to stabilish a WebSocket connection and communicate using Json-Rpc protocol.

The Dapp sends to the Wallet ***almost*** the same message it would send to Neo's RPC Server.
And then, the wallet asks the user if it can proceed with the operation. When approved by the user, the wallet sign the operation, make the request and send the response back to the Dapp. 

## Running on your machine/blockchain
- Both Dapp and Wallet have a file `constants/default.ts`. Check that file and change the variables to be able to run the tests with the desired blockchain and desired accounts.
- run `npm run start` for both applications (be aware that by default they use the same port, so one of them will ask you to confirm to use another port)