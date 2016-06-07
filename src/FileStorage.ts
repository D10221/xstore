import * as _ from 'underscore';
import * as fs from 'fs';
import * as path from 'path';
import {SerializeMap} from "./map_encoder";
import {SStorage} from "./storage";

export class FileStorage implements SStorage {

    static default(): SStorage {
        return new FileStorage(path.join(process.cwd(), 'db.json'));
    }

    constructor(private filePath:string) {

    }


    save<TKey,TValue>(map:Map<TKey,TValue>):Promise<any> {

        return new Promise<any>((resolve, reject)=> {
            fs.writeFile(
                this.filePath,
                SerializeMap(map), (e)=> {
                    if (_.isError(e)) {
                        reject(e);
                        return;
                    }
                    resolve(true)
                }
            )
        });
    }
}


