import {expect} from "chai"
import { Ballista } from "../ballista.js";
import { Metrics } from "../types/metrics.js";

describe('Ballista benchmark runner',()=>{
    it('should instantiate the class',()=>{
        const ballistaInstance = new Ballista({
            metricList:[Metrics.CUMULATIVE_LAYOUT_SHIFT],
            urlList:['https://trekbikes.com'],
        })
        expect(ballistaInstance).to.not.be.empty
    })
})