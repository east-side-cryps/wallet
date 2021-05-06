import Neon, {rpc, sc, tx} from '@cityofzion/neon-js'
import {Account} from '@cityofzion/neon-core/lib/wallet'
import {JsonRpcRequest, JsonRpcResponse} from "@json-rpc-tools/utils";

export class NeonHelper {
    private readonly network: string
    private readonly magic: number

    constructor(network: string, magic: number) {
        this.network = network
        this.magic = magic
    }

    rpcCall = async (account: Account, request: JsonRpcRequest): Promise<JsonRpcResponse> => {
        let result: any
        if (request.method === 'invokefunction') {
            let params: any[] = []
            if (request.params.length > 2) {
                params = request.params[2]
            }
            result = await this.sendTransaction(account, request.params[0] as string, request.params[1] as string, 0, ...params);
        } else {
            const {jsonrpc, ...queryLike} = request
            result = await new rpc.RPCClient(this.network).execute(Neon.create.query({...queryLike, jsonrpc: "2.0"}));
        }
        return {
            id: request.id,
            jsonrpc: "2.0",
            result
        }
    }

    sendTransaction = async (account: Account, scriptHash: string, operation: string, gas: number, ...args: any[]) => {
        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic: this.magic,
                rpcAddress: this.network,
                account,
            }
        );

        const testResp = await contract.testInvoke(operation, args)
        console.log("TEST RESULT", testResp)
        const resp = await contract.invoke(operation, args)

        return {
            testResp,
            resp
        }
    }
}