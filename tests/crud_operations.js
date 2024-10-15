const Album = require("../models/Album")
const { seed_db, testUserPassword } = require("../utils/seed_db")
const get_chai = require("../utils/get_chai");
const { app } = require("../app");
const { factory } = require("../utils/seed_db")

describe("Album List Test", function () {
  this.timeout(15000)
    //the set up 
    before(async () => {
      this.timeout(15000)  
    const { expect, request } = await get_chai();
    this.test_user = await seed_db();
    console.log("from crud_op Test User: ", this.test_user); 
    let req = request.execute(app).get("/sessions/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken"),
    );
    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };
    req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    res = await req;
    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
    });

    //test 1 get album list aka dispaly all albums
    it("Get album list", async () => {
    const { expect, request } = await get_chai();
    this.timeout(15000);
    //make the get request to album list page
    const res = await request
        .execute(app)
        .get("/albums")
        //set cookie to simulate logged in user
        .set("Cookie", this.sessionCookie) 
        .send();

        //assert a status of 200
        expect(res).to.have.status(200);

        //our album counter logic
        const pageParts = res.text.split("<tr>")
        expect(pageParts.length).to.equal(4)
  
    });
    // test 2 create new album (using seed_db)
    it("Add Album Entry", async () => {
        const { expect, request } = await get_chai();
        this.timeout(15000);
        //create new album
        const newAlbumData = await factory.build("album");
       
        //prepare album data
        const postData = {
          artist: newAlbumData.artist,
          album: newAlbumData.album,
          condition: newAlbumData.condition,
          rating: newAlbumData.rating,
          digitalRelease: newAlbumData.digitalRelease, 
          _csrf: this.csrfToken,
        };

        //the POST request
        const res = await request
          .execute(app)
          .post("/albums")
          .set("Cookie", [this.csrfCookie, this.sessionCookie])
          .set("content-type", "application/x-www-form-urlencoded")
          .send(postData)

        expect(res).to.have.status(200)
        const albums = await Album.find({createdBy: this.test_user._id})
        expect(albums.length).to.equal(4)
    })
    
});


