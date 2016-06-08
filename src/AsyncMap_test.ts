import * as Rx from 'rx';
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

            map.errors.subscribe(console.log);
            //map.events.where(e=>e.args.key == 'set').subscribe(console.log);

            await map.set(0, 'x');

            var value = await map.get(0);
            
            assert.equal('x', value);

            await map.set(0, 'y');

            value = await map.get(0);

            assert.equal('y', value);
    });
});