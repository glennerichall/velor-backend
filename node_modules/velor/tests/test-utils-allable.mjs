import {allable} from "../utils/allable.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('allable', () => {

    test('should have iterator', async () => {
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
        expect(v2).to.eq('tata');
    })

    test('should broadcast to all elements', async () => {
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

        let res = [...allable([obj1, obj2]).fct()];
        expect(res).to.deep.eq(['toto', 'tata']);
    })

    test('should access deep nested properties', async () => {
        let obj1 = {
            ha: {
                fct() {
                    return 'toto'
                }
            }
        }

        let obj2 = {
            ha: {
                fct() {
                    return 'tata'
                }
            }
        }

        let res = [...allable([obj1, obj2]).ha.fct()];
        expect(res).to.deep.eq(['toto', 'tata']);
    })

    test('should have length', async () => {
        let obj1 = {
            ha: {
                fct() {
                    return 'toto'
                }
            }
        }

        let obj2 = {
            ha: {
                fct() {
                    return 'tata'
                }
            }
        }
        const res = allable([obj1, obj2]).ha.fct();
        expect(res).to.have.length(2);
    })
})

