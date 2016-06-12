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

        const max = 11;

        const getMap = async () => {

            var dbPath = path.join(process.cwd(), 'xtest.db');
            var db = new Database(dbPath);
            var map = await new AsyncMap(db, 'test').ready().then(m=> m.clear());

            for(var i= 1 ; i < max; i++){
                await map.set(i, i.toString());
            }

            return map;
        };

        let map = await getMap();

        let count = 0 ;

        let action = (value) => {
            console.log('GotKey');
            console.log(value);
            count++;
        };

        for (var keyPromise of map.keys()) {
            let key = await keyPromise;
            if (key)
                action(key);
        }

        assert.equal(count, max-1);


    })
});

