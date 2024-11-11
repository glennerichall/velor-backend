import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {AxiosHeaders} from "../distribution/impl/AxiosHeaders.mjs";


const {
    expect,
    test
} = setupTestContext();


test.describe('AxiosHeaders', () => {
    let headers = null;

    test.beforeEach(() => {
        headers = new AxiosHeaders();
    });

    test('should start with empty headers', () => {
        expect(headers.toObj()).to.deep.equal({});
    });

    test('should append headers correctly', () => {
        headers.append('Content-Type', 'application/json');
        expect(headers.get('Content-Type')).to.equal('application/json');
    });

    test('should be case-insensitive', () => {
        headers.append('Content-Type', 'application/json');
        expect(headers.get('content-type')).to.equal('application/json');
    });

    test('should convert to object correctly', () => {
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        let expected = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        expect(headers.toObj()).to.deep.equal(expected);
    });

    test('should iterate through headers correctly', () => {
        headers.append('Accept', 'application/json');
        for (let header of headers) {
            expect(header).to.deep.equal({ name: 'Accept', value: 'application/json' });
        }
    });
});
