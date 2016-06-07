import * as path from 'path';
import {assert} from 'chai';
import * as sqs from './SqliteStorage';
import {SStorage} from "./storage";
import {Lazy} from "./lazy";
import {Database} from "sqlite3";
import {SqliteStorage} from "./SqliteStorage";
import {Thing} from "./Thing";

describe('SqliteStorage', ()=>{
    
    var storage:SqliteStorage<number,Thing>;

    beforeEach(()=>{
        storage = new SqliteStorage<number,Thing>(
            Thing,
            new Database(path.join(process.cwd(), 'test.db')),
            'things'
        );
    });

   it('set',async () => {
       
       var thing =  new Thing(0,'0');

       storage.set(0, thing);

       var first = storage.get(0);

       assert.equal(first, '{"id":0,"xname":"x"}')

   })

});