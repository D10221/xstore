import * as Rx from 'rx';
import {ObservableBase, KeyValue} from './DisposableBase';
import * as sqliteAsync from './sqliteAsync';
import {Database} from "sqlite3";
import {eachAsync} from "./sqliteAsync";
import {execAsync} from "./sqliteAsync";
import {whileNotEmpty} from "./whileNotEmpty";
import {allAsync} from "./sqliteAsync";

/***
 * Can't implement Map<K,Promise<V>> without breaking it's contract
 */
export class AsyncMap<K,V> extends ObservableBase /*implements Map<K,Promise<V>>*/ {
    /***
     *
     */
    constructor(private db:Database, private _storeName:string) {
        //...        
        super();

        this._errors = new Rx.Subject<Error>();

        sqliteAsync.execAsync(db, `create table if not exists ${this.storeName} (key text unique, value blob)`)
            .then(()=> {
                this.isReady = true;
            })
            .catch(this.onError)
    }

    get storeName():string {
        return `${this._storeName}_store`
    }

    _ready:boolean = false;

    get isReady():boolean {
        return this._ready;
    }

    set isReady(value:boolean) {
        if (this._ready == value) return;
        this._ready = value;
        this.publish('ready', value);
    }

    ready():Promise<this> {
        if (this.isReady) {
            return Promise.resolve(this);
        }
        //TODO: resolve.promiselike , adap promises
        return Promise.resolve(this.on('ready').take(1).toPromise()).then(()=> this);
    }

    drop():Promise<this> {
        return execAsync(this.db, `drop table ${this.storeName}`).then(x=> this);
    }

    onError = (e) => {
        if (e) {
            this._errors.onNext(e);
        }
    };

    clear():Promise<this> {
        return sqliteAsync.execAsync(this.db, `delete from ${this.storeName}`).then(()=> {
            this.publish('clear', true);
        })
            .then(x=> this)
            .catch(this.onError);
    }

    delete(key:K):Promise<boolean> {
        return sqliteAsync.execAsync(this.db,
            `delete ${this.storeName} where key = '${key}'`)
            .then(()=> {
                this.publish('delete', {key: key, value: true});
                return true;
            })
            .catch(this.onError)
    }

    *entries():IterableIterator<[K, Promise<V>]> {
        //Not Implemented
        let caller = yield null
    }

    forEach(callbackfn:(value:Promise<V>, index:K, map:Map<K, Promise<V>>) => void, thisArg?:any):void {
        //Not Implemented
    }

    get(key:K):Promise<V> {
        var query = `SELECT value from ${this.storeName} where key = '${key}'`;
        return sqliteAsync
            .allAsync<KeyValue>(this.db, query)
            .then(x=>
                x[0]
            )
            .then(x=>
                x && x.value ? JSON.parse(x.value) : null
            )
            .catch(this.onError);
    }

    set(key:K, v?:V):Promise<this> {
        var insert = `INSERT OR REPLACE INTO ${this.storeName} (key,value) VALUES ('${key}', '${JSON.stringify(v)}')`;
        return sqliteAsync.execAsync(this.db, insert)
            .then((v)=> {
                this.publish('set', {key: key, value: true});
                return this;
            })
            .catch(this.onError);
    };

    _errors = new Rx.Subject<Error>();

    get errors():Rx.Observable<Error> {
        return this._errors.asObservable();
    }

    has(key:K):Promise<boolean> {
        return Promise.resolve(true);
    }

    nextKey(from:number):Promise<K> {

        return allAsync<{ key:K }>(this.db,
            `select key from ${this.storeName} order by key limit ${from}, 1`)
            .then(x => {
                let f = x[0];
                return f ? f.key : null;
            });
    }

    /***
     * Super Slow!
     */
    *keys():IterableIterator<Promise<K>> {

        let i = 0;

        var from = this.nextKey(i);

        var next = ()=> this.nextKey(i++);

        for (var keyPromise of whileNotEmpty(from, next)) {

            yield keyPromise;
        }
    }

    size:number;

    *values():IterableIterator<Promise<V>> {
        let caller = yield null;
    }

    [Symbol.iterator]():IterableIterator<[K,Promise<V>]> {
        return null;
    }

    [Symbol.toStringTag]:"AsyncMap";

    /***
     * Fires once
     */
    on(eventKey:string):Rx.Observable<KeyValue> {
        return this.events.where(e=>e.args.key == eventKey)
            .select(e=> e.args)
            .take(1);
    }

    /***
     * Fires many times
     */
    when(eventKey:string):Rx.Observable<KeyValue> {
        return this.events.where(e=>e.args.key == eventKey)
            .select(e=> e.args);
    }
}