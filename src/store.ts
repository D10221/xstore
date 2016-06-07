import * as Rx from 'rx';
import * as iterables from './iterables';
import {FromMap, ToMaps, ToMap} from "./map_encoder";
import {Chain} from "./Chain";
import {newMap, ObservableMap} from "./map_factory";
import {any} from "./iterables";
import {ObservableBase, KeyValue, TKeyTValue} from "./DisposableBase";
import {SStorage} from "./storage";
//import {storage} from './storage';

function* _whereKey<TKey>(matchKey:(k:TKey)=> boolean,
                          maps:Map<TKey, Map<string,any>>):IterableIterator<Map<string,any>> {
    // ----
    for (var key of maps.keys()) {
        if (matchKey(key)) {
            yield maps.get(key);
        }
    }
    
    return newMap<string,any>();
}

/***
 *
 * @param type
 * @param matchValue
 * @param maps
 * @returns IterableIterator<T>
 */
function* _where<T,TKey>(type:{ new():T ;},
                         matchValue:(x:T)=> boolean,
                         maps:Map<TKey, Map<string,any>>)
/*returns*/:IterableIterator<T> {
    // ----
    for (var key of maps.keys()) {
        var map = maps.get(key);
        var value = FromMap(type, map);
        if (matchValue(value)) {
            yield value;
        }
    }

    return null;
}


export class Store<T,TKey> extends ObservableBase {

    maps:Map<TKey, Map<string,any>>;

    constructor(private type:{ new():T ;},
                private getKey:(t:T)=> TKey,
                private storage:SStorage,
                items?:T[]) {
        super();

        this.maps = items ? ToMaps(getKey, items) : newMap<TKey,Map<string,any>>();

    }

    /***
     * IterableIterator<Map<string,any>>
     * @param predicate
     */
    whereKey = (predicate:(k:TKey)=> boolean):IterableIterator<Map<string,any>> => _whereKey(predicate, this.maps);

    /***
     * Query the Type <T>
     * @param predicate
     */
    where = (predicate:(x:T)=> boolean):Chain<T> => new Chain(_where(this.type, predicate, this.maps));

    /***
     * Query the Maps
     * @returns {Chain}
     */
    get raw():Chain<Map<string,any>> {
        return new Chain(this.maps.values());
    };

    findKey = (predicate:(x:TKey)=> boolean) => iterables.first(this.whereKey(predicate));

    //find = (predicate: (x:T)=> boolean ) : T => iterables.first(this.where(predicate).);

    toType = (map:Map<string,any>):T => FromMap(this.type, map);


    add(item:T):Promise<T> {

        return new Promise((rs, rj) => {

            try {

                var key = this.getKey(item);

                if (this.keyExists(key)) {
                    rj(new Error(`Store: Error: Key: '${key}' already exists`));
                }

                this.once('set', key)
                    .then(map=>
                        this.flush().then(()=>rs(item))
                    )
                    .catch(e=> rj(e));

                this.maps.set(key, ToMap<string>(item));

            } catch (e) {
                rj(e);
            }
        });
    }
     
    flush():Promise<any> {
        return this.storage
            .save(this.maps);
    }

    when(actionKey:string, key:TKey):Rx.Observable<Map<string,string>> {

        return (this.maps as ObservableMap<TKey, Map<string,any>>)
            .events
            // var action = e.args.key;
            // var eventData =  e.args.value as KeyValue;
            // var key = eventData.key;
            .where(e=>e.args.key == actionKey && e.args.value.key == key)
            .select(e=> e.args.value.value)
    }

    once(actionKey:string, key:TKey):Promise<Map<string,string>> {
        return new Promise((resolve, reject)=> {
            return this.when(actionKey, key)
                .take(1)
                .subscribe(
                    x=> resolve(x),
                    err=> reject(err)
                );
        });
    }


    private keyExists(newKey:TKey) {
        return any(this.maps.keys(), key=> key == newKey);
    }

    remove(t:T):void {
        this.maps.delete(this.getKey(t));
    }

    clear() {
        this.maps.clear();
    }

}
