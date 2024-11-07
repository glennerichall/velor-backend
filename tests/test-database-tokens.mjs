import { setupTestContext } from 'velor-utils/test/setupTestContext.mjs';
import { createToken } from '../persistence/tokens.mjs';
import sinon from 'sinon';

const { expect, test } = setupTestContext();

test.describe('createToken', () => {
    // Setup a sandbox for each test
    let sandbox;
    test.beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    // Cleanup the sandbox after each test
    test.afterEach(() => {
        sandbox.restore();
    });

    // Test case: It should return a token when provided valid inputs
    test('returns a token when called with valid inputs', async ({}) => {
        // Mock the `client.query` method
        const client = {
            query: sandbox.stub().resolves({
                rows: [
                    { token: 'abc', expiration: new Date(), tag: 'tag' },
                ],
            }),
        };

        // Call the `createToken` function
        const token = await createToken(client, 'schema', 60, 'tag');

        // Assertions
        expect(token).not.to.be.undefined;
        expect(token).to.have.own.property('token');
        expect(token.token).to.equal('abc');
        expect(token).to.have.own.property('expiration');
        expect(token.expiration).to.be.instanceOf(Date);
        expect(token).to.have.own.property('tag');
        expect(token.tag).to.equal('tag');

        // Verify the `client.query` method was called with the correct arguments
        expect(client.query.calledOnce).to.be.true;


    });
});