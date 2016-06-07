import {any} from "./iterables";
export function profile(name:string, f:()=> void):void {
    console.time(name);
    f();
    console.timeEnd(name);
    console.log('\n');
}

export function wait(timeout:number) :Promise<any> {
    return new Promise<any>((rs)=>{
        setTimeout(()=>{
            rs(true);
        }, timeout)
    });
}