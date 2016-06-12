
import {LazyFunc} from "./lazy";

function isUndefined(x) {
    return 'undefined' == typeof x;
}

export function isEmpty(x:any):boolean {
    return isUndefined(x) || x == null
}

//---
async function checkEmpty<T>(p:Promise<T>, onEmpty) {
    var value = await p;
    if (isEmpty(value)) {
        onEmpty()
    }
    return value;
}

/***
 * Non recusrsion generator fty to iterate thru promised things, Last Value should be null
 * @param from
 * @param getNextValue
 * @returns {function(): IterableIterator<any>}
 */
export function whileNotEmpty<T>(from:Promise<T>, getNextValue:()=> Promise<T>) {

    let empty = false;

    //---
    function* gen(first:Promise<T>):IterableIterator<Promise<T>> {
        var next = yield checkEmpty(first, ()=> empty = true);
        while (next && !empty) {
            next = yield checkEmpty(next, ()=> empty = true)
        }
    }

    var lazyGen = new LazyFunc((first:Promise<T>) => gen(first));

    let next = () => lazyGen.value(() =>from).next(getNextValue());

    return function*() {

        for (var r = next(); !r.done ; r = next()) {

            yield r.value;
        }
    }()
}
