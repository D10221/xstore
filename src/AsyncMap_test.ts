import * as Rx from 'rx';
import * as path from 'path';
import {assert} from 'chai';
import {Database} from 'sqlite3';
import {AsyncMap} from './AsyncMap';

var dbPath = path.join(process.cwd(), 'test.db');

describe('AsyncMap', () => {

    it('works', async () => {        
        
        var db = new Database(dbPath);

        var map = await new AsyncMap<number, string>(db, 'things').ready();
        
        map.errors.subscribe(console.log);

        map.when('set')            
            .subscribe(console.log);

        await map.set(0, 'x');

        var value = await map.get(0);

        assert.equal('x', value);

        console.time('set');
        await map.set(0, 'y');
        console.timeEnd('set');
        console.time('set 2');
        await map.set(0, 'y');
        console.timeEnd('set 2');

        console.time('get');
        value = await map.get(0);
        console.timeEnd('get');

        assert.equal('y', value);

        console.time('set get');
        var x = await map.set(1, 'xyz').then(m => m.get(1));
        console.timeEnd('set get');

        assert.equal(x, 'xyz');
    });

    it('keys', async ()=>{

        var db = new Database(dbPath);

        var map = await new AsyncMap<number, string>(db, 'things')
            .ready();

        assert.isTrue(map._ready);

        map.errors.subscribe(e=> { throw e; });

        await map.clear();

        await map.set(1,'1');

        var value:number;

        for(var key of map.keys()){
            value = await key;
        }

        console.log('done');
        assert.equal(value, 1);


    })
});

