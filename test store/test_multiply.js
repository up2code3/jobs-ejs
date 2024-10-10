const multiply = require("../utils/multiply.js")
const get_chai = require("../utils/get_chai")

describe("testing multiply", () => {
     it("should give 7*6 is 42", async () => {
         const { expect } = await get_chai();
         expect(multiply(7,6)).to.equal(42)
     });

});