import {EmitterMixin} from "../utils/Emitter.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('EmitterMixin', function () {
    let emitter;

    test.beforeEach(function () {
        const Base = class {
        };
        const Emitter = EmitterMixin(Base);
        emitter = new Emitter();
    });

    test.describe('emit and on', function () {
        test('should register a listener and emit an event',async  function () {
           return new Promise(resolve => {
               emitter.on('testEvent', (value) => {
                   expect(value).to.equal('testValue');
                   resolve();
               });
               emitter.emit('testEvent', 'testValue');
           });
        });

        test('should emit asynchronously if async option is true', async function () {
           return new Promise((resolve) => {
               const Base = class {
               };
               const Emitter = EmitterMixin(Base);
               const asyncEmitter = new Emitter({async: true});

               let flag = false;
               asyncEmitter.on('asyncEvent', (value) => {
                   expect(value).to.equal('asyncValue');
                   expect(flag).to.be.true;
                   resolve();
               });

               asyncEmitter.emit('asyncEvent', 'asyncValue');
               flag = true; // This should be set before the async listener is executed
           })
        });
    });

    test.describe('emitNextTick', function () {
        test('should emit an event on the next tick', async function () {
            return new Promise((resolve) => {
                let called = false;
                emitter.on('nextTickEvent', (value) => {
                    called = true;
                    expect(value).to.equal('nextTickValue');
                    resolve();
                });
                emitter.emitNextTick('nextTickEvent', 'nextTickValue');
                expect(called).to.be.false;
            })
        });
    });

    test.describe('once', function () {
        test('should register a listener that only triggers once', function () {
            let callCount = 0;

            emitter.once('onceEvent', () => {
                callCount++;
            });

            emitter.emit('onceEvent');
            emitter.emit('onceEvent');
            expect(callCount).to.equal(1);
        });
    });

    test.describe('onAny', function () {
        test('should register a global listener for any event', async function () {
            return new Promise((resolve, reject) => {
                emitter.onAny((event, value) => {
                    expect(event).to.equal('anyEvent');
                    expect(value).to.equal('anyValue');
                    resolve();
                });
                emitter.emit('anyEvent', 'anyValue');
            });
        });
    });

    test.describe('awaitOn', function () {
        test('should resolve a promise when the event is emitted', async function () {
            setTimeout(() => emitter.emit('awaitedEvent', 'awaitValue1', 'awaitValue2'), 10);
            const [value1, value2] = await emitter.awaitOn('awaitedEvent');
            expect(value1).to.equal('awaitValue1');
            expect(value2).to.equal('awaitValue2');
        });
    });

    test.describe('off', function () {
        test('should unregister a listener', function () {
            const off = emitter.on('removeEvent', () => {
                throw new Error('This should not be called');
            });

            off();
            emitter.emit('removeEvent');
        });
    });

    test.describe('EmitterMixin - multiple listeners and once listener removal', function () {
        test('should not remove other listeners when once listener is removed during iteration', function () {
            let event1Count = 0;
            let event2Count = 0;
            let onceListenerCalled = false;

            const offEvent1 = emitter.on('event1', () => {
                event1Count++;
            });

            const offEvent2 = emitter.on('event2', () => {
                event2Count++;
            });

            emitter.once('event1', () => {
                onceListenerCalled = true;
            });

            // Emit the first event, which should trigger the once listener and the regular listener
            emitter.emit('event1');
            expect(onceListenerCalled).to.be.true;
            expect(event1Count).to.equal(1);

            // Emit the first event again, and ensure the once listener is not called again
            emitter.emit('event1');
            expect(event1Count).to.equal(2);

            // Ensure the second event listener still works and is not removed accidentally
            emitter.emit('event2');
            expect(event2Count).to.equal(1);

            // Clean up and ensure no listeners are wrongly removed
            offEvent1();
            offEvent2();

            // After removing the listeners, emit again to ensure they are not triggered
            emitter.emit('event1');
            emitter.emit('event2');
            expect(event1Count).to.equal(2);
            expect(event2Count).to.equal(1);
        });
    });


    test.describe('clear', function () {
        test('should clear all listeners', function () {
            emitter.on('clearEvent', () => {
                throw new Error('This should not be called');
            });
            emitter.clear();
            emitter.emit('clearEvent');
        });

        test('should clear global listeners', function () {
            emitter.onAny(() => {
                throw new Error('Global listener should not be called');
            });
            emitter.clear();
            emitter.emit('clearGlobalEvent');
        });
    });
});
