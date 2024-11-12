import {PubSubMessageBuilder} from "../messaging/PubSubMessageBuilder.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {getMessageBuilder} from "../../application/services/backendServices.mjs";
import {handleControlMessage as handleControlMessageFunction} from "../rpc/handlers/handleControlMessage.mjs";

export const composeReceiveFromPubSubListenerPolicy = (handleControlMessage = handleControlMessageFunction) =>
    function composeReceiveFromPubSubListener(services, subscriber) {

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
                    if (message.isSignatureValid) {
                        await handleControlMessage(services, subscriber, message);
                    } else {
                        getLogger(services).error('Control message signature is invalid');
                    }
                } else {
                    // send binary data through ws.
                    return subscriber.send(message);
                }
            } catch (e) {
                getLogger(services).error(e.stack);
            }
        }
    };


export const composeReceiveFromPubSubListener = composeReceiveFromPubSubListenerPolicy();