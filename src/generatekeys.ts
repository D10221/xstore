import * as Rx from 'rx';
import * as path from 'path';
import {assert} from 'chai';
import {Database} from 'sqlite3';

var dbPath = path.join(process.cwd(), 'test.db');

describe('generate', ()=> {

    function countKeys(db:Database) {
        return new Promise((resolve, reject)=> {
            db.all("select count(*) as count from things_store", (err, data)=> {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data[0].count)
            })
        });
    }

    function promiseKey (db:Database,skip:number) : Promise<any>{

        return new Promise((resolve, reject)=> {

            db.each("select key from things_store limit $skip, $count", {$skip: skip, $count: 1}, (e, data) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(data.key);
            });

        });
    }

    function* gen(db:Database) {

        var skip = 0;

        var completed = false;

        while (!completed) {
            var x = yield promiseKey(db, skip++).then(key=>{
                completed =  key ==null || key == undefined;
                return key;
            });
            if(!x){
                break;
            }
        }
    }

    it('What?', async()=> {

        var db = new Database(dbPath);

        //console.log(await countKeys(db).catch(e=> { throw e ; }));
        var g = gen(db);
        for (var x of g) {
            console.log(await x);
        }

        // var g = gen(db);
        // for (var r = g.next(); !r.done; r = g.next()) {
        //     console.log(await r.value);
        // }

        var subject = new Rx.Subject<any>();


    })

});