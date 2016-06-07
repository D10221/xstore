
export interface SStorage {
    
    save:<TKey,TValue>(map:Map<TKey,TValue>, key?:TKey) => Promise<any> ;
}
