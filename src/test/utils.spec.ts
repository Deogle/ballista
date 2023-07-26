import {expect} from "chai"
import { getReportProperty,averageValue } from "../util/utils.js"

describe('utility functions',()=>{
   it('should pull the property off an object given a path',()=>{
    const path = "test.path.deeply.nested"
    const object = {
        test:{
            path:{
                deeply:{
                    nested: true
                }
            }
        }
    }
    expect(getReportProperty(object,path)).to.equal(true)
   })
   it('should average the value at a given path',()=>{
    const path = 'test.path';
    const average = 30
    const objectList = [
        {
            test:{
                path:15
            }
        },
        {
            test:{
                path:30
            }
        },
        {
            test:{
                path:45
            }
        }
    ]
    expect(averageValue(objectList,path)).to.equal(average)
   })
})