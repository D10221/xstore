import {Database, Statement} from "sqlite3";

export function runAsync(db:Database, sql:string):Promise<any> {

    return new Promise((resolve, reject)=> {
        db.serialize(()=>{
            db.run(sql, e=> {
                if (_.isError(e)) {
                    reject(e);
                    return;
                }
                resolve(true)
            })
        })
    });
}


export function allAsync<T>(db:Database, sql:string):Promise<T[]> {
    return new Promise((resolve, reject)=> {
        db.serialize(()=>{
            db.all(sql, (err, data /*rows*/)=> {
                if (err) {
                    reject(err);
                    return
                }
                resolve(data);
            })
        })
    });
}

export function execAsync(db:Database, sql:string) :Promise<Database>{
        
    return new Promise((resolve, reject)=> {
        db.serialize(()=>{            
            db.exec(sql, (err)=> {
                if (err) {
                    reject(err);
                    return
                }
                resolve(db);
            })
        })
    });
}

export function execManyAsync(db:Database,...sql:string[]) :Promise<Database>{
    return new Promise((resolve, reject)=> {
        db.serialize(()=>
        {
            for(var script of sql){
                db.exec(script, (err)=> {
                    if (err) {
                        reject(err);
                        return
                    }
                })
            }
            resolve(db);
        })
    });
}

export function eachAsync<T>(db:Database, cmd:string, params?:any[]|{} ) : Promise<T>{
    
    return new Promise((resolve,reject)=>{
        db.serialize(()=>{
            try{
                db.each(cmd, params, (err, data)=>{
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(data);
                })
            }catch(e){
                reject(e);
            }
        });
    });
}