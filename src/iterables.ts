import * as _ from 'underscore';

export function toArray<T>(items: IterableIterator<T>) :T[]{
    var result: T[] = [];
    for(var item of items){
        result.push(item);
    }
    return result;
}

export function first<T>(items:IterableIterator<T> , predicate?: (x:T)=> boolean ) :T {

    if(!items){return null; }

    for(var item of items){
        if(!predicate || predicate(item)){
            return item;
        }
    }
    return null;
}

export function* range(start:number, end:number) : IterableIterator<number> {
    for(var i = 0 ; i<= end; i++){
        yield i;
    }
}

/***
 * A.k.a map
 * @param items
 * @param transform
 */
export function* select<T,TR>(items: IterableIterator<T>, transform:(t:T)=> TR ) {
    for (var item of items){
        yield transform(item);
    }
}

/***
 * A.k.a where
 * @param items
 * @param predicate
 */
export function* filter<T>(items:IterableIterator<T>, predicate: (t:T)=> boolean ) {
    for (var item of items)
        if (predicate(item)){
            yield item;
        }
}


export function any<T>(items:IterableIterator<T>, test:(x:T)=> boolean ): boolean {
    for(let item of items){
        if(test(item)){
            return true;
        }
    }
    return false;
}
