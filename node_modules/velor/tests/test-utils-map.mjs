import {
    MapArray,
    MapMap
} from "../utils/map.mjs";

import {setupTestContext} from "../test/setupTestContext.mjs";


const {
    expect,
    test
} = setupTestContext();

test.describe("Map tests", function () {
    test('should manip arrays', () => {
        let map = new MapArray();
        map.push('toto', 3, 4, 5, 6, 7);
        map.push('tata', 'a', 'b', 'c', 'd');

        expect(map.get('toto')).to.deep.eq([3, 4, 5, 6, 7]);
        expect(map.get('tata')).to.deep.eq(['a', 'b', 'c', 'd']);

        expect(map.pop('bob')).to.be.undefined;

        expect(map.pop('toto')).to.eq(7);
        expect(map.pop('toto')).to.eq(6);
        expect(map.pop('toto', 1)).to.eq(4);
        expect(map.get('toto')).to.deep.eq([3, 5,]);

        expect(map.findIndex('toto', i => i === 5)).to.eq(1);
        expect(map.findIndex('toto', i => i === 55)).to.eq(-1);


        expect(map.pop('toto')).to.eq(5);
        expect(map.pop('toto')).to.eq(3);
        expect(map.pop('toto')).to.eq(undefined);

        expect([...map.keys()]).to.deep.eq(['tata'])
    })

    test('should manip maps', () => {
        let map = new MapMap();

        map.hset('toto', 'titi', 2);
        map.hset('toto', 'tata', 3);

        expect(map.get('toto').get('titi')).to.eq(2);
        expect(map.get('toto').get('tata')).to.eq(3);

        expect(map.hget('toto', 'titi')).to.eq(2);
        expect(map.hget('toto', 'tata')).to.eq(3);
        expect(map.hget('toto', 'tete')).to.be.undefined;

        expect(map.get('bob')).to.be.undefined;
        expect(map.hget('bob', 'titi')).to.be.undefined;

        map.hdel('toto', 'titi');
        expect(map.hget('toto', 'titi')).to.be.undefined;

        map.hdel('toto', 'tata');
        expect(map.hget('toto', 'tata')).to.be.undefined;

        expect(map.get('toto')).to.be.undefined;
    })
})