import {range, filter, select , toArray , first } from "./iterables";

export function generate<T>(start:number, end:number , transform:(t:number)=> T) : Chain<T>{
    return new Chain(range(start,end)).select(transform );
}


export class Chain<TValue> {

    toArray(): TValue[] {

        return toArray(this.items);
    }

    constructor(private items: IterableIterator<TValue> ){

    }

    where = (predicate:(x:TValue)=> boolean) : Chain<TValue> => new Chain(filter( this.items,predicate));


    first( predicate?: (x:TValue) => boolean ) : TValue {

        return first( this.items ,predicate);
    }

    select = <TR>(transform:(t:TValue)=> TR) : Chain<TR> => new Chain(select(this.items, transform));
    

}