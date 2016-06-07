import * as Rx from 'rx';
import {EventArgs} from "./DisposableBase";


export function newMap<TKey,TValue>():Map<TKey,TValue> {
    return new ObservableMap<TKey,TValue>();
}

export class ObservableMap<TKey,TValue> extends Map<TKey,TValue> implements Rx.Disposable {

    _events = new Rx.Subject<EventArgs>();

    get events():Rx.Observable<EventArgs> {
        return this._events.asObservable();
    }

    publish(key:string, value:any) {
        this._events.onNext({sender: this, args: {key: key, value: value}});
    }


    constructor(iterable?:Iterable<[TKey, TValue]>) {
        super(iterable);

    }

    set(key:TKey, value:TValue) : this {

        super.set(key, value);
        this.publish('set', {key: key, value: value});
        return this;
    };
    
    delete(key: TKey): boolean {
        var deleted = super.delete(key);
        this.publish('delete', deleted);
        return deleted;
    };
    
     clear(): void {
         super.clear();
         this.publish('clear', true);
     }

    _disposed = false;

    get isDisposed():boolean {
        return this._disposed;
    }

    disposables = new Rx.CompositeDisposable();

    dispose() {

        if (this.isDisposed) {
            throw 'already disposed';
        }
        
        this._disposed = true;

        this.disposables.dispose();
        
        this._events.dispose();
    }

}




