import {minimatch} from "minimatch";
import {
    ACL_CATEGORY_ANY,
    BROADCAST_PUBLISH,
    BROADCAST_SUBSCRIBE,
    FILE_ACCESS_DELETE,
    FILE_ACCESS_LIST,
    FILE_ACCESS_READ,
    PERMISSION_DENY,
    PERMISSION_GRANT
} from "../../shared/constants/permissions.mjs";
import {getUser} from "../../server/application/services/requestServices.mjs";
import {
    getDatabase,
} from "../application/services/backendServices.mjs";
import {getServiceBinder} from "velor/utils/injection/ServicesContext.mjs";

export class AclValidator {
    constructor(acl) {
        this._acl = acl;
    }

    async isResourceGranted(resource, method) {
        this._acl = await Promise.resolve(this._acl);
        let match = this._acl
            .filter(x => x.method.split(',').includes(method) || x.method === '*' || method === '*')
            .filter(x => minimatch(resource, x.resource) ||
                x.resource === resource || x.resource === '*');

        let grant = match.filter(x => x.permission === PERMISSION_GRANT).length > 0;
        let deny = match.filter(x => x.permission === PERMISSION_DENY).length > 0;
        return grant && !deny;
    }

    async canSubscribe(event) {
        return this.isResourceGranted(event, BROADCAST_SUBSCRIBE);
    }

    async canPublish(event) {
        return this.isResourceGranted(event, BROADCAST_PUBLISH);
    }

    async canDeleteFiles(...entries) {
        return this.canAccessFiles(FILE_ACCESS_DELETE, ...entries);
    }

    async canListFiles(path) {
        return this.isResourceGranted(path, FILE_ACCESS_LIST);
    }

    async canReadFiles(...entries) {
        return this.canAccessFiles(FILE_ACCESS_READ, ...entries);
    }

    async canAccessFiles(mode, ...entries) {
        const granted = await Promise.all(
            entries.map(x => this.isResourceGranted(x, mode))
        );
        return granted.every(x => x);
    }
}

export function getAclValidator(req, category = ACL_CATEGORY_ANY) {

    const database = getDatabase(req);
    const user = getUser(req);
    const apiKey = req.headers['x-api-key'];

    let aclPromise;
    if (apiKey) {
        aclPromise = database.acl.queryAclForApiKey(apiKey, category)
    } else if (user) {
        aclPromise = database.acl.queryAclForUser(user.id, category)
    } else {
        aclPromise = Promise.resolve([])
    }
    return getServiceBinder(req).createInstance(AclValidator, aclPromise);
}