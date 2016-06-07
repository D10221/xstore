import {ObservableBase, KeyValue } from './DisposableBase';
import * as sqlite from 'sqlite3';
import * as sqliteAsync from './sqliteAsync';

import Database = sqlite.Database;

export class AsyncMap<K,V> extends ObservableBase implements Map<K,Promise<V>> {
   
    get storeName() :string {
        return `${this._storeName}_store`
    }  

    constructor(
            private db:Database,
            private _storeName:string){
        //...        
        super();

        sqliteAsync.execAsync(db, `create table if not exists ${this.storeName} (key text unique, value blob)`).then(()=>{
            this.publish('ready', true);
        }).catch(e=>{
            console.log(e);
            this.publish('ready', false);
        });
    }

    clear(): void {
        sqliteAsync.execAsync(this.db, `delete ${this.storeName}`).then(()=>{
            this.publish('clear', true);
        }).catch(e=>{
            console.log(e);
            this.publish('clear', false);
        })
    }

    delete(key: K): boolean {
        sqliteAsync.execAsync(this.db, `delete ${this.storeName} where key = '${key}'`)
        .then(()=>{
            this.publish('delete', { key: key, value: true } );
        }).catch(e=>{
            console.log(e);
            this.publish('delete', { key: key, value: false } );
        })
        return true;
    }

    *entries(): IterableIterator<[K, Promise<V>]>{
        let caller = yield null
    }

    forEach(callbackfn: (value: Promise<V>, index: K, map: Map<K, Promise<V>>) => void, thisArg?: any): void{

    }

    get(key: K): Promise<V>{
        return sqliteAsync
        .allAsync<KeyValue>(this.db, `SELECT * from ${this.storeName} where key = '${key}'`)
        .then(x=>  x[0])
        .then(x=> x&&x.value ? JSON.parse(x.value): null )
        .catch(e=>{
            console.log(e);
        });
    }

    has(key: K): boolean {
        return true;
    }

    *keys(): IterableIterator<K>{
        let caller = yield null;
    }

    set(key: K, value?: Promise<V>): Map<K, Promise<V>> {
        value        
        .then(v=> sqliteAsync.execAsync(this.db, `UPDATE ${this.storeName} set value = ${JSON.stringify(v)} where key = '${key}'`))
        .then(v=> sqliteAsync.execAsync(this.db, `INSERT OR IGNORE INTO ${this.storeName} (key,value) VALUES ('${key}', ${JSON.stringify(v)})`))
        .then(v=> sqliteAsync.allAsync(this.db,`SELECT count() from ${this.storeName} where key = '${key}'`))
        .then((v)=>{
            this.publish('set', { key: key, value: v.length > 0  } );
        }).catch(e=>{
            this.publish('set', { key: key, value: false } );
        })
        .catch(e=>{
            console.log(e);
        });

        return this;
    };

    size: number ;
    
    *values(): IterableIterator<Promise<V>> {
        let caller = yield null;
    }

    *[Symbol.iterator]():IterableIterator<[K,Promise<V>]>{
        let caller = yield null;
    }

    [Symbol.toStringTag]: "Map";
}