import * as path from 'path';
import * as sqlite from 'sqlite3';
import * as sqs from './SqliteStorage';
import {assert} from 'chai';
import * as iterables from './iterables';
import * as _ from 'underscore';
import * as util from './test_tools'



describe('SqliteStorage Funcs', ()=>{
  
    it('?', async ()=>{
     
        var db = new sqlite.Database(path.join(process.cwd(), 'no.db'));
      
       await sqs.createStore(db, 'test');
      
        class XType {
            xKey : string; 
            xValue: string;
        }
      
        var xType = new XType();
        xType.xKey = '1';
        xType.xValue = 'one';
      
       await sqs.saveAsync(db, 'test', 'xKey', xType )

        var x = await iterables.first(
            sqs.byKeySync(db, 'test', 'xKey', XType),
            item=> !_.isUndefined(item)
        );
       
        assert.equal(x.xKey, '1');
      
   });
   
});
