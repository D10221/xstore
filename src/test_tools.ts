export function profile(name:string, f:()=> void):void {
    console.time(name);
    f();
    console.timeEnd(name);
    console.log('\n');
}