import {BoolArray} from "../utils/buffer/BoolArray.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('BoolArray', () => {
    test('should calculate length', () => {
        const arr = new BoolArray(10);
        expect(arr).to.have.length(10)
    })

    test('should be false by default', () => {
        const arr = new BoolArray(10);
        for (let i = 0; i < arr.length; i++) {
            expect(arr.get(i)).to.be.false;
        }
    })

    test('should set to true', () => {
        const arr = new BoolArray(10);

        arr.set(1, true);
        arr.set(5, true);

        expect(arr.get(0)).to.be.false;
        expect(arr.get(1)).to.be.true;
        expect(arr.get(2)).to.be.false;
        expect(arr.get(3)).to.be.false;
        expect(arr.get(4)).to.be.false;
        expect(arr.get(5)).to.be.true;
        expect(arr.get(6)).to.be.false;
        expect(arr.get(7)).to.be.false;
        expect(arr.get(8)).to.be.false;
        expect(arr.get(9)).to.be.false;
    })

    test('should set to false', () => {
        const arr = new BoolArray(10);

        for (let i = 0; i < arr.length; i++) {
            arr.set(i, true);
        }

        arr.set(1, false);
        arr.set(8, false);

        expect(arr.get(0)).to.be.true;
        expect(arr.get(1)).to.be.false;
        expect(arr.get(2)).to.be.true;
        expect(arr.get(3)).to.be.true;
        expect(arr.get(4)).to.be.true;
        expect(arr.get(5)).to.be.true;
        expect(arr.get(6)).to.be.true;
        expect(arr.get(7)).to.be.true;
        expect(arr.get(8)).to.be.false;
        expect(arr.get(9)).to.be.true;
    })
})