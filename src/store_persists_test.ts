import * as Rx from 'rx';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import {assert} from 'chai';
import {Thing} from "./Thing";
import * as chain from './Chain';
import {Store} from "./store";
import {profile} from "./test_tools";
import {ObservableMap} from "./map_factory";
import {SerializeMap, Deserialize, DeserializeFromFileSync, DeserializeFromFileAsync} from "./map_encoder";
import * as iterables from './iterables';
import {FileStorage} from "./FileStorage";

describe('persistance', ()=>{

    var store:Store<Thing,number>;
    
    var storePath = path.join(process.cwd(), 'db.json');

    var mapSize = 3;

    beforeEach(()=> {

        var things = chain.generate(0, mapSize,
            x=> new Thing(x, x.toString()))
            .toArray();

        store = new Store(Thing, x=>x.id, FileStorage.default() ,things);
    });



    it('persists on change: add', async () => {

        var mapSize = 3 ;

        var key = mapSize+1;

        var things = chain.generate(0, mapSize,
            x=> new Thing(x, x.toString()))
            .toArray();

        store = new Store(Thing, x=>x.id, FileStorage.default() ,things);

        var thing = new Thing(key, key.toString());

        console.time('add:');

        var k = await store.add(thing);

        console.timeEnd('add:');
        
        assert.equal(k.id, key);

        var storeData = await DeserializeFromFileAsync<string,Map<string,any>>(storePath) ;

        var found = storeData.get(key.toString());

        var id = found.get('id');

        assert.equal(id, key);

    });

});
