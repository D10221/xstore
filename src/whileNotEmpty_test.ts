import {assert} from 'chai';

import {whileNotEmpty, isEmpty} from "./whileNotEmpty";

describe('isEmpty', ()=> {
    it('works', ()=> {
        let x:any = {};
        assert.isTrue(isEmpty(x.xyz));
        assert.isFalse(isEmpty(x));
        assert.isFalse(isEmpty(0));
        assert.isFalse(isEmpty(false));
        assert.isTrue(isEmpty(null));
    })
});

describe('untilEmpty', ()=> {

    it('works', async()=> {

        let i = 0;
        
        let next = ()=> i < 4 ? Promise.resolve(i++) : Promise.resolve(null);

        var from = Promise.resolve(i);

        let results = [] ;

        for (var x of whileNotEmpty(from, next)) {

            var value = await x;

            if(!isEmpty(value)){
                results.push(value);
                console.log(value);
            }
        }
        
        assert.equal(JSON.stringify(results),`[0,1,2,3]`)

    });
});