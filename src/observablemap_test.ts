import 'reflect-metadata';

import {assert} from 'chai';

import {Thing} from "./Thing";


import {isObject, ToMap, ToMaps, FromMap, FromMaps, ToObject} from "./map_encoder";

import * as chain from './Chain';
import {newMap, ObservableMap} from "./map_factory";
import {profile} from "./test_tools";


describe('ObservableMap', ()=>{
    it('set', ()=>{
        var map = new ObservableMap();
        
       profile('add key', ()=>{
           map.set('x', 'x');
       }) ;
        
        assert.equal(map.get('x'), 'x', ' set');
    });
});