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
import {Serialize} from "./map_encoder";

describe('persistance', ()=>{

    var store:Store<Thing,number>;
    
    var filePath = path.join(process.cwd(), 'db.json');

    var mapSize = 300000;

    beforeEach(()=> {

        var things = chain.generate(0, mapSize,
            x=> new Thing(x, x.toString()))
            .toArray();

        store = new Store(Thing, x=>x.id, things);
    });



    it('persists on change', function(done){

        this.timeout(5000);

        store.add(new Thing(mapSize+1, 'new item'));
        
        mapSize++;

        var calls = 0 ;
        (store.maps as ObservableMap<number, Map<string,any>>)
            .events
            //.where(e=>e.args.key == 'set')
            .subscribe(e=>{

                var map : ObservableMap<number, Map<string,any>> = null;
                var data:string;
                var key = e.args.key;

                profile(`on ${key} => ${mapSize} => serialize`,()=>{
                    map = (e.sender as ObservableMap<number, Map<string,any>>);
                    data = Serialize(map);
                });

                profile(`${key} : write toFile`, ()=>{
                    fs.writeFileSync(filePath, data)
                });

                calls++;
            });

        var thing = new Thing(mapSize+1, 'new item');

        profile('add : getKey',()=>{
            store.add(thing);
        });
        
        store.remove(thing);

        store.clear();

        assert.equal(calls, 3);

        done();

    });

});
