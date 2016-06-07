import * as Rx from 'rx';


export class ObservableBase implements  Rx.Disposable {

    _events = new Rx.Subject<EventArgs>();

    get events():Rx.Observable<EventArgs> {
        return this._events.asObservable();
    }

    publish(key:string, value:any) {
        this._events.onNext({sender: this, args: {key: key, value: value}});
    }
    
    
    _disposed = false;

    get isDisposed():boolean {
        return this._disposed;
    }

    disposables = new Rx.CompositeDisposable();

    notDisposed() : void {
        if (this.isDisposed) {
            throw 'already disposed';
        }
    }
    
    dispose() {

        this.notDisposed();
        
        this._disposed = true;

        this.disposables.dispose();

        this._events.dispose();
    }
}

export interface KeyValue {
    key:string ;
    value:any
}

export interface TKeyTValue <TKey,TValue>{
    key:TKey ;
    value:TValue
}

export interface EventArgs {
    sender:any,
    args:KeyValue ;

}

