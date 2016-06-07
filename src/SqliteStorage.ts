import * as _ from 'underscore';
import * as path from 'path';
import {SerializeMap, ToMap, FromMap} from "./map_encoder";
import * as sqlite from 'sqlite3';
import {Lazy} from "./lazy";
import {Database} from "sqlite3";
import {ObservableBase} from "./DisposableBase";
import {first} from "./iterables";

export var dbPath = "storage.db";

export var defaultDb:Lazy<Database> = new Lazy<Database>(()=>
    new sqlite.Database(
        path.isAbsolute(dbPath)
            ? dbPath
            : path.join(process.cwd(), dbPath)));


export class SqliteStorage<TKey, TValue> extends ObservableBase implements Map<TKey,Promise<TValue>> {

    private _storeKey : string ;

    get storeKey (){
        return `${this._storeKey}_store`;
    }

    constructor(private type:{ new():TValue ;}  ,private db:Database,  storeKey:string) {
        super();

        this._storeKey = storeKey;

        createStore(db, this.storeKey )
    }


    toString() : string {
        return 'SqliteStorage'
    }

    size:number;

    clear():void {
        clearStore(this.db, this.storeKey)
            .then( ()=>{
                this.publish('clear', { key: this.storeKey , value: ''});
        });
    }

    delete(key:TKey): boolean {

        deleteStoreKeySync(this.db, this.storeKey, key.toString());

        this.publish('', { key: '' , value: ''});

        return true;
    }

    async get(key:TKey): Promise<TValue> {
        
        var value =  await  byKey(
                this.db, this.storeKey,
                key.toString(),
                this.type );
        return value;
    }

    has(key:TKey):boolean {
        return null;
    }

    keys(): IterableIterator<TKey> {
        return null;
    }


    entries():IterableIterator<any> {
        return null;
    }

    set(key:TKey, value?:Promise<TValue>): Map<TKey,Promise<TValue>> {

        return this;
    }

    values():IterableIterator<any> {
        return null;
    }

    forEach(callbackfn:(value:any, index:TKey, map:Map<TKey, any>)=>void, thisArg?:any):void {

    }

    [Symbol.iterator]():IterableIterator<[TKey,TValue]>{
         return null;
    };

    [Symbol.toStringTag]: "Map";

}


function runAsync(db:Database, sql:string):Promise<any> {

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
function execAsync(db:Database, sql:string) :Promise<Database>{
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

export function updateAsync<TKey>(db:Database , storeKey:string , key:TKey, data: string) :Promise<any> {
    return runAsync(db, `UPDATE ${storeKey}_store  SET data = '${data}' where ID = '${key}'`)
}

export function insertAsync<TKey>(db:Database , storeKey:string , key:TKey, data: string) : Promise<any> {
    return runAsync(db, `INSERT OR IGNORE INTO ${storeKey}_store (id, data) VALUES ('${key}', '${data}')`)
}

export function saveAsync<T, TKey>(db:Database , storeKey:string , key:TKey, type:T):Promise<any> {

    return new Promise(async(resolve, reject)=> {

        try {

            var data = JSON.stringify(type);

            await updateAsync(db, storeKey ,key, data);

            await insertAsync(db, storeKey ,key, data);

            resolve(true);

        } catch (e) {
            reject(e)
        }
    });
}

export function createStore(db:Database, storeKey: string) : Promise<Database>{

    return execAsync(db,
        `CREATE TABLE IF NOT EXISTS ${storeKey}_store (ID TEXT UNIQUE NOT NULL, DATA BLOB NOT NULL)`)
}

export function dropStore(db:Database, storeKey: string) : Promise<Database>{
    return execAsync(db,
        `CREATE TABLE IF EXISTS ${storeKey}`);
}

export function clearStore(db:Database, storeKey: string) : Promise<Database> {
    return execAsync(db, `DELETE ${storeKey}`);
}

export function deleteStoreKey(db:Database, storeKey: string ,itemKey: string) : Promise<Database> {
    return execAsync(db, `DELETE ${storeKey} WHERE id = '${itemKey}'`);
}

export function* deleteStoreKeySync(db:Database, storeKey: string ,itemKey: string) : IterableIterator<boolean> {

    const caller = yield; // (A)

    deleteStoreKey(db,storeKey,itemKey)
        .then(() =>  caller.success(true))
}

export function byKey<TKey, TValue>(db:Database, storeKey: string, key:TKey, type: {new():TValue;}): Promise<TValue>{

    return allAsync(db, `SELECT data from ${storeKey} where id = '${key}'`)
        //TODO simplify FromMap(this.type,ToMap(rows[0]))
        .then(rows => FromMap(type,ToMap(rows[0])));
}

export function all(db:Database, storeKey:string  ) : Promise<Map<string,any>[]> {
    return allAsync(db,`SELECT data from ${this.storeKey}`)
        .then(rows => rows.map(row=> ToMap(row)));
}


/***
 * is not sync
 */
export function* byKeySync<TValue>(db:Database, 
                                   storeKey:string, key:string, type: {new(): TValue} )
:IterableIterator<Promise<TValue>>{
//---
    const caller = yield  byKey(db, storeKey ,key, type )
    //TODO simplify FromMap(this.type,ToMap(rows[0]))
        .then((row:TValue) => {
            return FromMap(type,ToMap(row))
        });
}


class DbIterator<T> implements  IterableIterator<T> {

    [Symbol.iterator](): IterableIterator<T> {
        return undefined;
    }

    constructor(){
        interface Iterator {


        }
    }

    next(value?: any): IteratorResult<T> {
        return null;
    };

    //return?(value?: any): IteratorResult<T>{    }

    //throw?(e?: any): IteratorResult<T> {};

}
