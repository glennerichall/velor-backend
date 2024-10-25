import {Synchronizer} from "../utils/sync.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext()

test.describe('synchronizer', () => {
    test('should synchronize', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);
            sync.getSync('toto')
                .then(res => {
                    expect(res).to.have.property('john', 'doe');
                    resolve();
                })
                .catch(e => reject(e));
            sync.notify('toto', {'john': 'doe'});
        });
    });

    test('should check duplicate id ', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);
            sync.getSync('toto').catch(e => {
            });
            sync.getSync('toto')
                .then(() => reject(new Error('No duplicates are allowed')))
                .catch(e => resolve());
        });
    });

    test('should not notify nonexistent id', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);
            try {
                sync.notify('toto');
                reject(new Error('should have thrown'));
            } catch (e) {
                resolve();
            }
        });
    });

    test('should timeout', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);
            sync.getSync('toto')
                .then(() => reject(new Error('Timeout expected')))
                .catch(e => resolve());
        })
    });


    test('should reset ids after successful notification', async () => {
        const sync = new Synchronizer(100);
        let promise = sync.getSync('toto');
        sync.notify('toto', {'john': 'doe'});
        await promise;
        promise = sync.getSync('toto');
        sync.notify('toto');
        await promise;
    });

    test('should reset ids after timeout', async () => {
        const sync = new Synchronizer(100);
        try {
            await sync.getSync('toto');
        } catch (e) {
            expect(e).to.be.an('Error');
        }
        let promise = sync.getSync('toto');
        sync.notify('toto');
        await promise;
    });

    test('should timeout in specified time max', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);

            const id = setTimeout(() => {
                reject(new Error('Timeout expected in 100ms max'));
            }, 120);

            sync.getSync('toto')
                .then(() => reject(new Error('Timeout expected')))
                .catch(e => {
                    clearTimeout(id);
                    resolve();
                });
        });
    });

    test('should timeout in specified time min', async () => {
        return new Promise((resolve, reject) => {
            const sync = new Synchronizer(100);

            let ok = false;
            const id = setTimeout(() => {
                ok = true;
            }, 99);

            sync.getSync('toto')
                .then(() => reject(new Error('Timeout expected')))
                .catch(e => {
                    if (ok) {
                        resolve()
                    } else {
                        reject(new Error('Timeout expected in 100ms min'))
                    }
                });
        });
    });

    test('should do nothing on revoke non existent', async () => {
        const sync = new Synchronizer(100);
        sync.revoke('tata');
    })

    test('should revoke sync', async () => {
        const sync = new Synchronizer(100);
        let promise = sync.getSync('toto');
        sync.revoke('toto');

        expect(sync.hasSync('toto')).to.be.false;

        await promise.catch(e => {
            expect(e.name).to.eq('RevokedError');
        });
    })
})