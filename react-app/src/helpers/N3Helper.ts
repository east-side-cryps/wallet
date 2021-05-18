import {rpc} from "@cityofzion/neon-js";
import {ContractParamJson} from "@cityofzion/neon-core/lib/sc";

export class N3Helper {
    private readonly rpcAddress: string
    private readonly networkMagic: number

    constructor(rpcAddress: string, networkMagic: number) {
        this.rpcAddress = rpcAddress
        this.networkMagic = networkMagic
    }

    getVersion = async () => {
        const rpcClient = new rpc.RPCClient(this.rpcAddress)
        const v = await rpcClient.getVersion()
        console.log(v)
    }

    getNotificationsFromTxId = async (txId: string) => {
        const rpcClient = new rpc.RPCClient(this.rpcAddress)

        // TODO: use Joe's websocket to create `await waitForTheNextBlock()` - http://54.227.25.52:9009/
        let appLog
        do {
            try {
                appLog = await rpcClient.getApplicationLog(txId)
            } catch (e) {
                await this.sleep(5000)
            }
        } while (!appLog)

        const allNotifications: {
            contract: string;
            eventname: string;
            state: ContractParamJson;
        }[] = []
        appLog.executions.forEach(e => {
            allNotifications.push(...e.notifications)
        })

        return allNotifications
    }

    private sleep = (time: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }
}