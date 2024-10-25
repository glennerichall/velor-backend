import {
    composeRetryUntil,
    debounce
} from "../utils/functional.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";


const {
    expect,
    test
} = setupTestContext();

test.describe('functional', () => {
    test('should debounce', async () => {

        let result = '';

        const f1 = async (a, b, c) => {
            // append results, this will ensure the functions are called in sequence
            result += a + b + c;
            return new Promise(resolve => {
                setTimeout(() => resolve(a + b + c), 200);
            });
        };

        const f = debounce(f1);

        // do not wait, run next call
        let p1 = f('a', 'b', 'c');

        // do not wait, be check that the function is debounced
        const promise1 = f('d', 'e', 'f')
            .then(() => {
                // test should not hit here since test will be debounced
                throw new Error('nono')
            })
            .catch(m => expect(m.message).to.equal('debounced'))

        // do not wait, be check that the function is debounced
        const promise2 = f('d', 'e', 'f')
            .then(() => {
                // test should not hit here since test will be debounced
                throw new Error('nono')
            })
            .catch(m => expect(m.message).to.equal('debounced'))

        // here wait the results
        const f3 = await f('f', 'g', 'h');
        expect(f3).to.eql('fgh');
        expect(await p1).to.eq('abc');

        // ensure functions are called sequentially
        expect(result).to.eql('abcfgh');

        await promise1;
        await promise2;
    })

    test('should retry', async () => {

        let count = 0;
        const args = await composeRetryUntil(async (...args) => {
            count++;
            if (count !== 3) {
                throw new Error();
            }
            return args;
        })('toto', 'tata');

        expect(args).to.deep.eq(['toto', 'tata']);
        expect(count).to.eq(3);
    })

})