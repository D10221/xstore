import * as _ from 'underscore';

export class Lazy<T>{

    private _fty : ()=> T ;

    private built = false;

    constructor(f:()=> T){
        this._fty = f;
    }

    _t :T;

    get isValueCreated(): boolean {
        return typeof this._t != 'undefined';
    }
    
    get value(): T {
        if(!this.built){
            this.built = true;
            this._t = this._fty();
            return this._t;
        }
        return this._t;
    }
}

export class LazyFunc<T>{

    //private _fty : (...params:any[])=> T ;

    private built = false;

    constructor(private factory:(...params:any[])=> T){

    }

    _t :T;

    get isValueCreated(): boolean {
        return typeof this._t != 'undefined';
    }

    value(...params: any[]): T ;
    value(lazyParams: ()=> any[]): T ;
    value(x:any) {
        if(!this.built){
            let params = _.isFunction(x) ? x() : x;
            this.built = true;
            this._t = this.factory(params);
            return this._t;
        }
        return this._t;
    }
}

