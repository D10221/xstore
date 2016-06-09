/***
 * https://github.com/ericelliott/ogen/blob/master/source/ogen.js
 */

import * as Rx from 'rx';

/* eslint-disable no-use-before-define */
if (typeof setImmediate !== 'function') {
    var setImmediate = fn => setTimeout(fn, 0);
}

const isPromise = (obj) => typeof obj !== 'undefined' && typeof obj.then === 'function';

const next = (iter:IterableIterator<any>, observer:Rx.Observer<any>, prev?:any) => {

    let item;

    try {
        item = iter.next(prev);
    } catch (err) {
        return observer.onError(err);
    }

    const value = item.value;

    if (item.done) {
        return observer.onCompleted();
    }

    if (isPromise(value)) {
        value.then(val => {
            observer.onNext(val);
            setImmediate(() => next(iter, observer, val));
        }).catch(err => {
            return observer.onError(err);
        });
    } else {
        observer.onNext(value);
        setImmediate(() => next(iter, observer, value));
    }
};

export const ogen = (fn) => (...args:any[]) => {
    return Rx.Observable.create(observer => {
        next(fn(...args), observer);
    });
};

