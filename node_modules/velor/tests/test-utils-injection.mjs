import {isClass} from "../utils/injection/isClass.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('injection', () => {
    test('should determine if obj is a class', ()=> {

        class A{}

        expect(isClass(class {
        })).to.be.true;

        expect(isClass(A)).to.be.true;

        expect(isClass(class extends A{})).to.be.true;

        expect(isClass(new A())).to.be.false;

        expect(isClass(function () {
        })).to.be.false;

        expect(isClass(() => {
        })).to.be.false;

        expect(isClass('')).to.be.false;
    })
})