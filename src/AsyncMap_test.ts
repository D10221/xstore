import * as path from 'path';
import {assert} from 'chai';
import {Database} from 'sqlite3';
import {AsyncMap} from './AsyncMap';

describe('AsyncMap',()=>{
    
    var db:Database;
    var map: AsyncMap<number, string>;
    var dbPath = path.join(process.cwd(), 'test.db'); 
    
    beforeEach(()=>{
        db = new Database(dbPath);
        map = new AsyncMap<number, string>(db,'things');
    });

    it('works', async ()=>{
            map.events.where(e=>e.args.key == 'set').subscribe(e=> {
                console.log(e);
            })

            map.set(0, Promise.resolve('x'))

            var value = await map.get(0);
            
            assert.equal('x', value);
    });
});