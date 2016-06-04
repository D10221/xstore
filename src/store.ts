import * as iterables from './iterables';
import {FromMap, ToMaps, ToMap} from "./map_encoder";
import {Chain} from "./Chain";
import {newMap, ObservableMap} from "./map_factory";
import {any} from "./iterables";

function* whereKey<TKey>(

    matchKey:(k:TKey)=> boolean,
    maps:Map<TKey, Map<string,any>>  ) : IterableIterator<Map<string,any>> {
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
function* whereT<T,TKey>(type:{ new():T ;},
                        matchValue:(x:T)=> boolean,
                        maps:Map<TKey, Map<string,any>>)
    /*returns*/: IterableIterator<T> {
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



export class Store<T,TKey> {

    maps:Map<TKey, Map<string,any>>;

    constructor(private type : { new():T ;} ,private getKey:(t:T)=> TKey ,items?:T[]) {
        this.maps = items? ToMaps(getKey, items) : newMap<TKey,Map<string,any>>();
    }

    /***
     * IterableIterator<Map<string,any>>
     * @param predicate
     */
    whereKey = (predicate:(k:TKey)=> boolean ) : IterableIterator<Map<string,any>>  => whereKey(predicate, this.maps);

    /***
     * Query the Type <T>
     * @param predicate
     */
    where = (predicate:(x:T)=> boolean) : Chain<T>  => new Chain(whereT(this.type, predicate, this.maps));

    /***
     * Query the Maps
     * @returns {Chain}
     */
    get raw() : Chain<Map<string,any>> {
        return new Chain(this.maps.values());
    };

    findKey = (predicate: (x:TKey)=> boolean ) => iterables.first(this.whereKey(predicate));
    
    //find = (predicate: (x:T)=> boolean ) : T => iterables.first(this.where(predicate).);
    
    toType = (map:Map<string,any>) : T => FromMap(this.type,map);
    
    //TODO:
    // instead of this fire fire async save return promise  ?
    // but what if this store is also part of a store collection and parent whnts to save all at once?
    // who is reposible for eventually persisting the changes ?
    add(item:T) : Promise<T> {
         
        //To Complicated
        // pehaps observe on constructor for all events coming from map merge then forward notification, or simple write if every stopre has its own file  
        return new Promise( (rs,rj) => {
            
            try{
                var newKey = this.getKey(item);

                if(any(this.maps.keys(), key=> key == newKey)){
                    rj(new Error(`Store: Error: Key: '${newKey}' already exists`));
                }

                //??? Unneeded ? 
                (this.maps as ObservableMap<TKey, Map<string,any>>)
                    .events.where(e=> e.args.key == 'set' && e.args.value.key == newKey)
                    .take(1)
                    //.toPromise()
                    .subscribe(e=>{
                        var value = e.args.value.value;
                        rs(this.toType(value));
                    });


                this.maps.set(newKey, ToMap<string>(item));
                
            } catch(e){
                
                rj(e);
            }
        });
    }
    
    remove(t:T): void {
        this.maps.delete(this.getKey(t));
    }
    
    clear(){
        this.maps.clear();
    }
    
}




