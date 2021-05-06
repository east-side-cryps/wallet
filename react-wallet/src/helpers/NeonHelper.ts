import Neon, {rpc, sc, tx} from '@cityofzion/neon-js'
import {Account} from '@cityofzion/neon-core/lib/wallet'
import {WitnessScope} from '@cityofzion/neon-core/lib/tx/components/WitnessScope'
import {JsonRpcRequest, JsonRpcResponse} from "@json-rpc-tools/utils";

export class NeonHelper {
    private readonly network: string
    private readonly magic: number

    constructor(network: string, magic: number) {
        this.network = network
        this.magic = magic
    }

    rpcCall = async (account: Account, request: JsonRpcRequest): Promise<JsonRpcResponse> => {
        let resp: any
        if (request.method === 'invokefunction') {
            let params: any[] = []
            if (request.params.length > 2) {
                params = request.params[2]
            }
            resp = await this.sendTransaction(account, request.params[0] as string, request.params[1] as string, 0, ...params);
        } else {
            const {jsonrpc, ...queryLike} = request
            resp = await new rpc.RPCClient(this.network).execute(Neon.create.query({...queryLike, jsonrpc: "2.0"}));
        }
        return resp as JsonRpcResponse
    }

    sendTransaction = async (account: Account, scriptHash: string, operation: string, gas: number, ...args: any[]) => {
        const rpcClient = new rpc.RPCClient(this.network)
        await account.decrypt("mypassword");
        let tries = 0

        do {

            try {
                tries++

                const script = sc.createScript({
                    scriptHash,
                    operation,
                    args,
                });

                // @ts-ignore
                const scopes = WitnessScope.CalledByEntry

                const txLike = {
                    script,
                    signers: [{
                        account: account.scriptHash,
                        scopes,
                    }],
                    systemFee: 1000,
                }
                // @ts-ignore
                const transaction = new tx.Transaction(txLike)

                console.log('signing')
                const signed = transaction.sign(account) // TODO: this is not working, maybe because the magic, but I've already tested with the network magic
                console.log('serializing')
                const serialized = signed.serialize(true)
                console.log('sending')
                return await rpcClient.sendRawTransaction(serialized);

            } catch (e) {
                if (tries > 1) {
                    throw e
                }
                await this.timeout(100)
            }
        } while (tries < 2)

        throw new Error('Impossible Error')
    }

    timeout = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}