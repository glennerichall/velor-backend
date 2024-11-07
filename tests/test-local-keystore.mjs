import { setupTestContext } from 'velor-utils/test/setupTestContext.mjs';
import {LocalKeyStore} from "../distribution/impl/LocalKeyStore.mjs";
const { expect, test } = setupTestContext();

test.describe('LocalKeyStore', () => {
    let localKeyStore;

    test.beforeEach(() => {
        localKeyStore = new LocalKeyStore();
    });

    test('remove - key', () => {
        localKeyStore.set('key1', 'value1');
        localKeyStore.remove('key1');
        expect(localKeyStore.get('key1')).to.be.undefined;
    });

    test('update', () => {
        localKeyStore.set('key1', 'value1');
        localKeyStore.update('key1', value => value + 'updated');
        expect(localKeyStore.get('key1')).to.equal('value1updated');
    });

    test('incr', () => {
        let result = localKeyStore.incr('key1');
        expect(result).to.equal(0);
        result = localKeyStore.incr('key1');
        expect(result).to.equal(1);
    });

    test('incr - key not present', () => {
        const result = localKeyStore.incr('key1');
        expect(result).to.equal(0);
    });

    test('push', () => {
        localKeyStore.push('key1', 'value1');
        expect(localKeyStore.get('key1')).to.deep.equal(['value1']);
    });

});