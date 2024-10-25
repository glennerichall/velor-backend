import {thenable} from "../utils/thenable.mjs";
import {timeoutAsync} from "../utils/sync.mjs";

import {allable} from "../utils/allable.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('thenable', () => {
    let promise;

    test.beforeEach(async () => {
        promise = new Promise((resolve, reject) => {
            resolve({
                call1: async () => {
                    return {
                        call2: (a, b) => {
                            return {
                                key: {
                                    call4: async () => {
                                        return a + b + 'toto';
                                    },
                                    level: 4
                                },
                                level: 3
                            }
                        },
                        level: 2
                    }
                },
                level: 1
            });
        });
    })

    test('should get 1 level', async () => {
        const res = await thenable(promise);
        expect(res).to.have.property('level', 1);
    })

    test('should get 2 level', async () => {
        const res = await thenable(promise).call1();
        expect(res).to.have.property('level', 2);
    })

    test('should get 3 level', async () => {
        const res = await thenable(promise).call1().call2();
        expect(res).to.have.property('level', 3);
    })

    test('should get 4 level', async () => {
        const res = await thenable(promise).call1().call2().key;
        expect(res).to.have.property('level', 4);
    })

    test('should get 5 level', async () => {
        const res = await thenable(promise).call1().call2('a', 'b').key.call4();
        expect(res).to.eq('abtoto');
    })

    test('should bind methods of class', async () => {
        class Toto {
            constructor() {
                this.val = 'toto';
            }

            do() {
                return this.val;
            }
        }

        const val = await thenable(Promise.resolve(new Toto())).do();
        expect(val).to.eq('toto');
    })

    test('should call correctly event when not fulfilled immediately', async () => {
        let val = {
            call1() {
                return 'toto'
            }
        };

        const promise = timeoutAsync(1000);

        const res = await thenable(promise.then(() => val)).call1();
        expect(res).to.eq('toto');
    })

    test('should throw if method does not exist', async () => {
        let obj = {
            async fct() {
            }
        };
        let error;
        try {
            await thenable(Promise.resolve(obj)).toto();
        } catch (err) {
            error = err;
        }
        expect(error).to.be.an('Error');
        expect(error.message).to.eq("Function 'toto' does not exist");
    })

    test('should broadcast to all elements in array', async () => {
        let obj1 = {
            fct() {
                return 'toto'
            }
        }

        let obj2 = {
            fct() {
                return 'tata'
            }
        }

        let [v1, v2] = allable([obj1, obj2]).fct();
        expect(v1).to.eq('toto');
        // expect([v1, v2]).to.deep.equal(['toto', 'tata']);
    })

    // TODO find a way to determine if an object is a proxy, because proxies are seen as "thenables" ie objects with a
    // then method test('should handle proxy as return value from promise', async () => { let handler = { get(target,
    // prop, receiver) { if (prop === 'toto') return 'yes'; else throw new Error(`Function ${prop} does not exist`); }
    // } let obj = new Proxy({}, handler); expect(await thenable(obj).toto).to.eq('yes'); })
})

