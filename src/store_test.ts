import 'reflect-metadata';

import {assert} from 'chai';

import {Thing} from "./Thing";
import * as chain from './Chain';
import {Store} from "./store";
import {profile} from "./test_tools";


describe("store", ()=> {
    
    var store:Store<Thing,number>;
    var storeSize = 100000;

    beforeEach(()=> {

        var things = chain.generate(0, storeSize,
            x=> new Thing(x, x.toString()))
            .toArray();

        store = new Store(Thing, x=>x.id, things);
    });

    it("find Key", ()=> {

        var found:any = null;

        profile('find1stKey', ()=> {
            found = store.findKey(x=> x == 0);
        });

        profile('findLastKey', ()=> {
            found = store.findKey(x=> x == storeSize-1)
        });

        assert.equal(found.get('xname'), `${storeSize-1}`);

    });

    it('find thing', ()=> {

        var f:Thing = null;

        profile('find thing', ()=> {
            f = store.where(thing=> thing.xname == `${storeSize-1}`).first()
        });

        assert.equal(f.xname, `${storeSize-1}`);

    });

    it('where Many', ()=> {

        var result:Thing[] = [];

        profile('where many', ()=> {
            result = store.where(thing=> thing.xname == `${storeSize-1}`).toArray();
        });

        assert.equal(result.length, 1);

    });

    it('raw', ()=> {

        var xname:any = null ;

        profile('map query', ()=> {
            xname = store.raw.where(map=> map.get('id') == storeSize-1).first().get('xname');
        });

        assert.equal(xname, `${storeSize-1}`)
    });

    it('raw => thing', ()=> {

        var xname:any = null ;

        profile('map query to 1st Thing like', ()=> {
            xname = store.raw
                .where(map=> map.get('id') >= storeSize-10 && map.get('id') <= storeSize-1)
                .select(store.toType)
                .first().xname;
        });

        assert.equal(xname, `${storeSize-10}`)
    });

    
    it('add: throws on existing key', async ()=>{
        var key = 1;
        var err: Error = null;
        await store.add(new Thing(key, '1'))
            .catch(
                e=> err = e
            );
        assert.equal(err.message, `Store: Error: Key: '${key}' already exists`)
    });

    it('add: callBack?', async ()=>{

        var key = storeSize+1;

        var err: Error = null;

        var result = await store.add(new Thing(key, key.toString()))
            .catch(e=>{
                throw e;
            });

        console.log(result);
        assert.equal(result.id, key);
    })
});



