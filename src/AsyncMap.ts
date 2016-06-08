import * as Rx from 'rx';
import {ObservableBase, KeyValue} from './DisposableBase';
import * as sqliteAsync from './sqliteAsync';
import {Database} from "sqlite3";

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

        sqliteAsync.execAsync(db, `create table if not exists ${this.storeName} (key text unique, value blob)`).then(()=> {
            if(this._ready){
                return;
            }
            this._ready = true;
            this.publish('ready', true);
        })
        .catch(this.onError)
    }
    
    get storeName():string {
        return `${this._storeName}_store`
    }

    _ready:boolean = false;
    ready() : Rx.Promise<this> {        
        return this.on('ready').take(1).toPromise().then(()=> this);
    }

    onError =(e) => {
        if(e){
            this._errors.onNext(e);
        }
    };
    
    clear(): Promise<any> {
        return sqliteAsync.execAsync(this.db, `delete ${this.storeName}`).then(()=> {
            this.publish('clear', true);
        })
        .catch(this.onError);
    }

    delete(key:K): Promise<boolean> {   
        return sqliteAsync.execAsync(this.db,
            `delete ${this.storeName} where key = '${key}'`)
            .then(()=> {
                this.publish('delete', {key: key, value: true});
                return true;
            })
            .catch(this.onError)
    }

    *entries():IterableIterator<[K, Promise<V>]> {
        let caller = yield null
    }

    forEach(callbackfn:(value:Promise<V>, index:K, map:Map<K, Promise<V>>) => void, thisArg?:any):void {

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

    set(key:K, v?:V): Promise<this> {
            var insert = `INSERT OR REPLACE INTO ${this.storeName} (key,value) VALUES ('${key}', '${JSON.stringify(v)}')`;
            return sqliteAsync.execAsync(this.db,insert)
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

    *keys():IterableIterator<K> {
        let caller = yield null;
    }

    size:number;

    *values():IterableIterator<Promise<V>> {
        let caller = yield null;
    }

    *[Symbol.iterator]():IterableIterator<[K,Promise<V>]> {
        let caller = yield null;
    }

    [Symbol.toStringTag]:"AsyncMap";

    /***
     * Fires Once; and disposes
    */
    on(eventKey:string ) : Rx.Observable<KeyValue> {
        return this.events.where(e=>e.args.key == eventKey)
        .select(e=> e.args)
        .take(1);
    }

    /***
     * Fires  many times  
     */
    when(eventKey:string ) : Rx.Observable<KeyValue> {
        return this.events.where(e=>e.args.key == eventKey)
        .select(e=> e.args);        
    }
}