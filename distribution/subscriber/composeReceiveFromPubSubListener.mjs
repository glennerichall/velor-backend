import {handleControlMessage} from "../rpc/handleControlMessage.mjs";
import {PubSubMessageBuilder} from "../messaging/PubSubMessageBuilder.mjs";
import {
    getMessageBuilder
} from "../../application/services/backendServices.mjs";
import {getLogger} from "velor/utils/injection/services.mjs";

// A publication handler is a function that receives messages from a particular channel, the one
// that is currently subscribe in this case. The publication handler also
// handles commands between servers. Setting the user id of logged clients for instance
// or getting info from subscribed users of a channel. It sends messages through the same
// subscribed channel.
export function composeReceiveFromPubSubListener(services, transport) {

    const messageBuilder = getMessageBuilder(services);

    // The handler accepts either an ArrayBuffer, string or a JSON string to be sent through the client WS.
    // If the JSON string represents an internal control command, it will not be sent to the WS but executed
    // accordingly.
    return async buffer => {

        // Parse the control. If the parsing fails, then it is not a control object
        // but raw data who need to be sent to the client.
        try {
            let message = new PubSubMessageBuilder(messageBuilder).unpack(buffer);
            if (message.isControl) {
                await handleControlMessage(services, transport, message);
            } else {
                // send binary data through ws.
                return transport.send(message);
            }
        } catch (e) {
            getLogger(services).error(e.stack);
        }
    }
}