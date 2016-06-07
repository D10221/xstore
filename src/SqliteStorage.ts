import * as _ from 'underscore';
import * as path from 'path';
import {SerializeMap, ToMap, FromMap} from "./map_encoder";
import * as sqlite from 'sqlite3';
import {Lazy} from "./lazy";
import {Database} from "sqlite3";
import {ObservableBase} from "./DisposableBase";
import {first} from "./iterables";
import * as Rx from 'rx';
import isPromise = Rx.helpers.isPromise;
import {allAsync, execAsync, runAsync} from './sqliteAsync'

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
        
        run(byKey(this.db, this.storeKey, key, this.type),
            deleteStoreKey(this.db, this.storeKey, key.toString()),
            Promise.resolve(this.publish('delete', { key: key , value: ''}))
        );

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

    set(key:TKey, pvalue?:any): Map<TKey,Promise<TValue>> {
        
        var value = isPromise(pvalue) ? pvalue : Promise.resolve(pvalue);
       
        chain(
            ()=> value,
            (xvalue)=> saveAsync(this.db, this.storeKey, key,xvalue),
            ()=> Promise.resolve(this.publish('set', { key: key, value: value} ))
        );
        
        return this;
    }

    values():IterableIterator<any> {
        return null;
    }

    forEach(callbackfn:(value:any, index:TKey, map:Map<TKey, any>)=>void, thisArg?:any):void {

    }

    [Symbol.iterator]():IterableIterator<[TKey,Promise<TValue>]>{
         return null;
    };

    [Symbol.toStringTag]: "Map";

}


export function updateAsync<TKey>(db:Database , storeKey:string , key:TKey, data: string) :Promise<any> {
    return runAsync(db, `UPDATE ${storeKey}  SET data = '${data}' where ID = '${key}'`)
}

export function insertAsync<TKey>(db:Database , storeKey:string , key:TKey, data: string) : Promise<any> {
    return runAsync(db, `INSERT OR IGNORE INTO ${storeKey} (id, data) VALUES ('${key}', '${data}')`)
}

export function saveAsync<T, TKey>(db:Database , storeKey:string , key:TKey, type:T): Promise<any> {

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
        `CREATE TABLE IF NOT EXISTS ${storeKey} (ID TEXT UNIQUE NOT NULL, DATA BLOB NOT NULL)`)
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


export function byKey<TKey, TValue>(db:Database, storeKey: string, key:TKey, type: {new():TValue;}): Promise<TValue>{

    return allAsync(db, `SELECT data from ${storeKey} where id = '${key}'`)
        //TODO simplify FromMap(this.type,ToMap(rows[0]))
        .then(rows => {
            var row = rows[0];
            return FromMap(type,ToMap(row));
        });
}

export function all(db:Database, storeKey:string  ) : Promise<Map<string,any>[]> {
    return allAsync(db,`SELECT data from ${this.storeKey}`)
        .then(rows => {
            return rows.map(row=> ToMap(row))
        });
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

async function run(...promises: Promise<any>[]){
    for(var promise of promises){
        await promise;
    }
}

async function chain(...promises: ((x:Promise<any>)=> Promise<any> )[]){
    var res = null;
    for(var promise of promises){
        res = await promise(res);
    }
}
