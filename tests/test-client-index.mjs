import {setupTestContext} from 'velor-utils/test/setupTestContext.mjs';
import {ClientIndex} from "../distribution/ClientIndex.mjs";
import {LocalAsyncKeyStore} from "../distribution/impl/LocalKeyStore.mjs";
import crypto from "crypto";

const {expect, test} = setupTestContext();

test.describe('ClientIndex', function () {

    test('should add client', async () => {
        let index = new ClientIndex('my_key', new LocalAsyncKeyStore());

        let client1 = {
            id: crypto.randomBytes(999),
            getInfo() {
                return {
                    uuid: crypto.randomUUID(),
                    serverId: crypto.randomUUID()
                }
            }
        };
        let result = await index.add(client1);

        expect(result).to.be.true;

    })

    test('should get clients', async () => {
        let index = new ClientIndex('my_key', new LocalAsyncKeyStore());

        let client1 = {
            id: crypto.randomInt(999),
            uuid: crypto.randomUUID(),
            serverId: crypto.randomUUID(),
            getInfo() {
                return this;
            }
        };

        let client2 = {
            id: crypto.randomInt(999),
            uuid: crypto.randomUUID(),
            serverId: crypto.randomUUID(),
            getInfo() {
                return this;
            }
        };
        await index.add(client1);
        await index.add(client2);

        let clients = await index.getAll();

        expect(clients).to.have.length(2);

        expect(clients[0]).excluding('getInfo').to.deep.eq(client1);
        expect(clients[1]).excluding('getInfo').to.deep.eq(client2);
    })

    test('should remove clients', async () => {
        let index = new ClientIndex('my_key', new LocalAsyncKeyStore());

        let client1 = {
            id: crypto.randomInt(999),
            uuid: crypto.randomUUID(),
            serverId: crypto.randomUUID(),
            getInfo() {
                return this;
            }
        };

        let client2 = {
            id: crypto.randomInt(999),
            uuid: crypto.randomUUID(),
            serverId: crypto.randomUUID(),
            getInfo() {
                return this;
            }
        };

        let client3 = {
            id: crypto.randomInt(999),
            uuid: crypto.randomUUID(),
            serverId: crypto.randomUUID(),
            getInfo() {
                return this;
            }
        };

        await index.add(client1);
        await index.add(client2);
        await index.add(client3);

        let clients = await index.getAll();
        expect(clients).to.have.length(3);

        await index.remove(client1, client3);
        clients = await index.getAll();
        expect(clients).to.have.length(1);

        expect(clients[0]).excluding('getInfo').to.deep.eq(client2);
    })


});