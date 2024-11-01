import {RpcSignalingManager} from "velor-messaging/messaging/managers/RpcSignalingManager.mjs";
import {getProvider} from "velor/utils/injection/baseServices.mjs";
import {s_sync} from "../services/backendServiceKeys.mjs";

export function createRpcSignalingManager(services) {
    const provider = getProvider(services);

    return new RpcSignalingManager(
        provider[s_sync]()
    );
}