const { app } = require("../app.js");
const get_chai = require("../utils/get_chai.js")

describe("test multiply api", function (){
    it("Should multiply two numbers", async () => {
        const {expect, request} = await get_chai();
        const req = request
        .execute(app)
        .get("/multiply")
        .query({ first: 7, second: 6 })
        .send();
        const res = await req;
        expect(res).to.have.status(200);
        expect(res).to.have.property("body");
        expect(res.body).to.have.property("result");
        expect(res.body.result).to.equal(42);
    });
});