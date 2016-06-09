import * as Rx from 'rx';
import * as path from 'path';
import {assert} from 'chai';
import {Database} from 'sqlite3';

var dbPath = path.join(process.cwd(), 'test.db');

describe('sqlite',  ()=>{
    it('works',async ()=>{
        var db =  new Database(dbPath);

    let sqltext = "insert or replace into things_store (key,value) values ('z', 'z')";

    console.time('sqlite insert');
    await new Promise((rs, rj)=>{
        db.exec(sqltext, err=>{
            if(err){
                rj(err);
                return;
            }
            rs(true);
        });
    });
    console.timeEnd('sqlite insert');

    console.time('sqlite insert 2');
    await new Promise((rs, rj)=>{
        db.exec(sqltext, err=>{
            if(err){
                rj(err);
                return;
            }
            rs(true);
        });
    });
    console.timeEnd('sqlite insert 2');

    
    //Statement 
    let insertCmd = "insert or replace into things_store (key,value) values ($key, $value)";
    var params = { $key: 'z', $value: 'z'};
    var statement  = db.prepare(insertCmd);

    console.time('sqlite insert statement');
    await new Promise((rs, rj)=>{
        statement.run( params ,err=>{
            if(err){
                rj(err);
                return;
            }
            rs(true);
        });
    });
    console.timeEnd('sqlite insert statement');

    console.time('sqlite insert statement 2');
    await new Promise((rs, rj)=>{
        statement.run( params ,err=>{
            if(err){
                rj(err);
                return;
            }
            rs(true);
        });
    });
    console.timeEnd('sqlite insert statement 2');

    params.$key = 'q1';

    console.time('sqlite insert statement 3');
    await new Promise((rs, rj)=>{
        statement.run( params ,err=>{
            if(err){
                rj(err);
                return;
            }
            rs(true);
        });
    });
    console.timeEnd('sqlite insert statement 3');

    

    console.time('sqlite insert statement 4');
    statement.run( params ,err=>{
            if(err){
                throw err;                
            }            
        });
    console.timeEnd('sqlite insert statement 4');
  

    let key = 'z';
    console.time('sqlite get');
    var data = await new Promise((rs,rj)=>{
        db.all(`select * from things_store where key = '${key}'`, (err, data)=>{
            if(err){
                rj(err);
                return;
            }
            rs(data);
        });
    });
    console.timeEnd('sqlite get');
    assert.equal(data[0].key, 'z');
    assert.equal(data[0].value, 'z');
    
    })

});
