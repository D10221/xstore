import 'reflect-metadata';

import {assert} from 'chai';
import {Thing} from "./Thing";


import {isObject, ToMap, ToMaps, FromMap, FromMaps, ToObject} from "./map_encoder";

import * as chain from './Chain';
import {newMap} from "./map_factory";
import {profile} from "./test_tools";


describe('mapEncoder', ()=> {

    describe('ToObject', ()=> {

        it('works', ()=> {

            var map = newMap<string,Map<string,any>>();

            var innerMap = newMap<string,any>();

            innerMap.set('innerKey', {prop: 'x'});

            map.set('topKey', innerMap);

            var obj = ToObject(map);

            var json = JSON.stringify(obj);

            var expected = JSON.stringify({topKey: {innerKey: {prop: 'x'}}});

            assert.equal(json, expected);

        })

    });

    describe('isObject', ()=> {
        it('works', ()=> {

            assert.isTrue(isObject({}), '{} isObject');
            assert.isTrue(isObject(new Thing()), 'class is Object');
            assert.isFalse(isObject(""), 'string is Object');
            assert.isFalse(isObject(1), 'number is Object');

        });
    });

    describe('ToMap', ()=> {

        it('works', ()=> {

            var map:Map<string, Map<string, Map<string, any>>> = null ;

            profile('ToMap',()=>{
                map = ToMap({topKey: {innerKey: {prop: 'x'}}}) as Map<string,Map<string,Map<string,any>>>;
            });

            assert.equal(map.get('topKey').get('innerKey').get('prop'), 'x');

        });
    });

    describe('ToMaps', ()=> {

        it('works', ()=> {

            var things = [new Thing()];

            var mapped = ToMaps(thing=> thing.id, things)

            assert.equal(mapped.get(0).get('id'), 0);
        });
    });
    
    describe('FromMap', ()=> {
        it('works', ()=> {
            var map = newMap<string, any>();
            map.set('id', 1);
            map.set('xname', 'x');
            var thing = FromMap(Thing, map);
            assert.isDefined(thing, 'is there such a thing');
            assert.equal(thing.id, 1, ' id equals ');
            assert.equal(thing.xname, 'x', 'xname equals ');
        });
    });


    describe('fromMaps', ()=> {

        it('works', ()=> {

            var expected = [{id: 0, xname: 'x'}, {id: 1, xname: 'y'}];

            var maps:Map<number,Map<string, any>> = ToMaps(x=>x.id, expected as Thing[]);

            var things = FromMaps(Thing, maps.values());

            assert.deepEqual(things, expected);

        });

    });

    describe('From Maps To Maps', ()=> {

        it('Works with 100000 recordst', ()=> {

            var things = chain
                .generate(0, 100000, x=> new Thing(x, x.toString()))
                .toArray();

            var maps:Map<any, Map<string, any>> = null;
            profile('toMaps: 100,000', ()=>{
                maps = ToMaps(x=> x.id, things);
            });

            var out:Thing[] = null;
            profile('fromMaps: 100,000', ()=>{
                out = FromMaps(Thing, maps.values());
            });

            assert.equal(JSON.stringify(out), JSON.stringify(things))

        })
    });



});