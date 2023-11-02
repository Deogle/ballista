import {assert} from "chai";
import FileWriter from "../util/file-writer.js";

describe('default FileWriter class',()=>{
    it('should throw an error given an invalid directory',()=>{
        const errorFunc = () => new FileWriter({directoryName:'fakeDir'})  
        assert.throw(errorFunc,Error,"Directory 'fakeDir' does not exist")
    })
})