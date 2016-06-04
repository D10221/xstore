import * as fs from 'fs';
import {newMap} from "./map_factory";

export interface Collection<T> {

}

export interface Indexer<T extends string|number|symbol|any> extends Collection<T> {
    [index: string]: T;
}

export function isMap(x:any) : x is Map<any,any>{
    return x instanceof Map
}

export function ToObject(map: Map<any,any>): Object {

    var o :any = Object.create(null);

    for(let [k, v] of map.entries()) {
        o[k] = isMap(v) ? ToObject(v): v;
    }
    return o;
}

export function isObject(x:any){
    return typeof x == 'object';
}

export function ToMap<TKey>(obj:Indexer<any>) : Map<TKey,any>{
    let strMap = newMap<TKey,any>();
    for (let k of Object.keys(obj)) {
        var value = obj[k];
        strMap.set(k as any, isObject(value) ? ToMap(value) : value );
    }
    return strMap;
}

export function Serialize<K,V>(map : Map<K,V>) : string {
    return JSON.stringify(ToObject(map));
}

export function SerializeToFile<K,V>(filePath: string, map : Map<K,V>) : void {
     fs.writeFileSync(
        filePath,
        JSON.stringify(ToObject(map))
    );
}

export function Deserialize<K,V>(json :string) :  Map<K,V> {
    return ToMap<K>(JSON.parse(json));
}

export function DeserializeFromFile<K,V>(filePath:string) :  Map<K,V> {
    ToMap(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
    return
}


export function ToMaps<T,TKey>(key: (target:T) => TKey, targets:T[]) : Map<TKey,Map<string, any>> {

    var map = newMap<TKey,Map<string,any>>();

    targets.forEach(target=> {

        map.set(key(target), ToMap<string>(target));
    });

    return map ;
}

export function FromMap<T,TKey>(type: { new(): T ;} , map: Map<TKey, any>){

    var target  = new type();

    // value: V, index: K, map: Map<K, V>
    map.forEach(( v : any , k: TKey )=> {
        (target as any)[k as any] = v
    });

    return target;

}


export function FromMaps<T,TKey>(type: { new(): T ;} , maps:IterableIterator<Map<TKey,any>>) : T[] {

    var result :T[] = [] ;

    for(var map of maps){

        result.push(FromMap(type, map))
    }
    return result;
}