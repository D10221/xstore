import * as Rx from 'rx';
import * as path from 'path';
import {assert} from 'chai';
import {Database} from 'sqlite3';
import {ogen} from './ogen';

describe('ogen', ()=> {

    function fetchSomething(): Promise<any> {
        return Promise.resolve('hello');
    }

    const myFunc = function*(param1, param2, param3) : IterableIterator<any> {
        const result = yield fetchSomething(); // returns promise

        // waits for promise and uses promise result
        yield result + ' 2';
        yield param1;
        yield param2;
        yield param3;
    };
    

    it('?', ()=> {
        const onNext = val => console.log(val);
        const onError = err => console.log(err);
        const onComplete = () => console.log('done.');

        const asyncFunc = ogen(myFunc);

        // Call the async function and pass params.
        asyncFunc('a param', 'another param', 'more params!')
            .subscribe(onNext, onError, onComplete);
        // future value
        // future value 2
        // a param
        // another param
        // more params!
        // done.
    })


});
