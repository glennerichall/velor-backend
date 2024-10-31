import {FrontendMessageFactory} from "../../distribution/FrontendMessageFactory.mjs";
import {getMessageBuilder} from "../services/backendServices.mjs";

export function createMessageFactoryInstance(services) {
    let messageBuilder = getMessageBuilder(services);
    return new FrontendMessageFactory(messageBuilder);
}