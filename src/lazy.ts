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
