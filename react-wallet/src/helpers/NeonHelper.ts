import Neon, {rpc, sc, tx} from '@cityofzion/neon-js'
import {Account} from '@cityofzion/neon-core/lib/wallet'
import {JsonRpcRequest, JsonRpcResponse} from "@json-rpc-tools/utils";

export class NeonHelper {
    private readonly rpcAddress: string
    private readonly networkMagic: number

    constructor(rpcAddress: string, networkMagic: number) {
        this.rpcAddress = rpcAddress
        this.networkMagic = networkMagic
    }

    rpcCall = async (account: Account, request: JsonRpcRequest): Promise<JsonRpcResponse> => {
        let result: any
        if (request.method === 'invokefunction') {
            let params: any[] = []
            if (request.params.length > 2) {
                params = request.params[2]
            }
            result = await this.sendTransaction(account, request.params[0] as string, request.params[1] as string, ...params);
        } else {
            const {jsonrpc, ...queryLike} = request
            result = await new rpc.RPCClient(this.rpcAddress).execute(Neon.create.query({...queryLike, jsonrpc: "2.0"}));
        }
        return {
            id: request.id,
            jsonrpc: "2.0",
            result
        }
    }

    sendTransaction = async (account: Account, scriptHash: string, operation: string, ...args: any[]) => {
        const convertedArgs = args.map(a => (
            a.type === 'Address' && a.value !== undefined
                ? sc.ContractParam.hash160(a.value)
                : a))

        const client = new rpc.RPCClient(this.rpcAddress);
        let resp
        try {
            resp = await client.invokeFunction(
                scriptHash,
                operation,
                convertedArgs,
                [
                    new tx.Signer({
                        account: account.scriptHash,
                        scopes: tx.WitnessScope.CalledByEntry,
                    }),
                ])
        } catch (e) {
            console.log(e)
            resp = { error: {message: e.message, ...e} }
        }

        return resp
    }
}