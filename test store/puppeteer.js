const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword, factory } = require("../utils/seed_db");
const Album = require("../models/Album");
const get_chai = require("../utils/get_chai");

let testUser = null;
let page = null;
let browser = null;

// Launch a Broswer at this time

describe("Albums-ejs Puppeteer test" , async function () {
    before(async function () {
        this.timeout(10000);
        // browser = await puppeteer.launch()
        browser = await puppeteer.launch({headless: false, slowMo: 10})
        page = await browser.newPage();
        await page.goto("http://localhost:3000");
    })
    after(async function () {
        this.timeout(5000);
        await browser.close()
    })
    describe("go to site", function () {
        it("should have made a connection", async function () {});
    })
    describe("index page test", function () {
        this.timeout(10000);
        it("finds home page log in link", async () => {
            this.logonLink = await page.waitForSelector(
            "a ::-p-text(LOGIN)",    
            );
        });
        it("gets to the login page", async () => {
            await this.logonLink.click();
            await page.waitForNavigation();
            const email = await page.waitForSelector('input[name="email"]')
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');
            this.password = await page.waitForSelector('input[name="password"]');
            this.submit = await page.waitForSelector("button ::-p-text(Logon)")
        })
        it("sends the logon", async () => {
            testUser = await seed_db();
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);
            await this.submit.click();
            await page.waitForNavigation();
            await page.waitForSelector(`p ::-p-text(User ${testUser.name} is logged on.)`);
            await page.waitForSelector("a ::-p-text(SECRET WORD)");
            await page.waitForSelector('a[href="/secretWord"]');
            
            const copyr = await page.waitForSelector("p ::-p-text(copyRight)");
            const copyrText = await copyr.evaluate((el) => el.textContent);  
            console.log("copyright text:", copyrText)
        });
    });
    describe("puppeteer album operations", function () {
        it("TEST 1 should click VIEW ALBUMS and confirm 4 entries", async () => {
            const { expect } = await get_chai();
            //find the button
            const viewAlbumsLink = await page.waitForSelector('a ::-p-text(VIEW ALBUMS)')
            //click the button
            await viewAlbumsLink.click();
            await page.waitForNavigation();
            //get the page content
            const content = await page.content();
            //count albums aka <tr>s
            const albumEntries = content.split("<tr>").length;
            // confirm target number
            expect(albumEntries).to.equal(4);
        })
        it("TEST 2 should click add albums, verify form, resolve fields", async () => {
            const { expect } = await get_chai();

            //wait for add album button
            const addAlbumButton = await page.waitForSelector('a ::-p-text(Add New Album)');

            // click the add button
            await addAlbumButton.click();
            await page.waitForNavigation()

            //verify it is the add album form 3 parts 
            //1st find the selector <h2>  Add Album
            const AddAlbumHeading = await page.waitForSelector('h2 ::-p-text(Add Album)');
            //2nd store text from h1 heading in a variable
            const headingText = await AddAlbumHeading.evaluate(el => el.textContent);
            //3rd expoect
            expect(headingText).to.include("Add Album");
            
            //Resolve (find) Comp/pos fields and add butn
            const artistField = await page.waitForSelector('input[name="artist"]');
            const albumField = await page.waitForSelector('input[name="album"]');
            const conditionField = await page.waitForSelector('input[name="condition"]');
            const ratingField = await page.waitForSelector('input[name="rating"]');
            const digitalReleaseField = await page.waitForSelector('input[name="digitalRelease"]');
            
            const addButton = await page.waitForSelector('button ::-p-text(Add Album)');

            //assert that comp/pos/addbuttn are not null
            expect(artistField).to.not.be.null;
            expect(albumField).to.not.be.null;
            expect(conditionField).to.not.be.null;
            expect(ratingField).to.not.be.null;
            expect(digitalReleaseField).to.not.be.null;
            expect(addButton).to.not.be.null;
        })
        it("TEST 3 should add a new album and verify on album list", async () => {
            const { expect } = await get_chai()
            
            //create the new album
            const newAlbumData = await factory.build("album");

            //type artist as field value
            const artistField = await page.waitForSelector('input[name="artist"]');
            await artistField.type(newAlbumData.artist)
           
            //type album as field value
            const albumField = await page.waitForSelector('input[name="album"]');
            await albumField.type(newAlbumData.album)
            
            //pick a condition
            const conditionField = await page.waitForSelector('select[name="condition"]');
            await conditionField.select(newAlbumData.condition); 

            //pick a rating
            const ratingField = await page.waitForSelector('input[name="rating"]');
            console.log('Ratingdfffffffffffffffffffff:', newAlbumData.rating); 
            await ratingField.type(newAlbumData.rating.toString());

            //if true click button
            const digitalReleaseField = await page.waitForSelector('input[name="digitalRelease"]');
            if (newAlbumData.digitalRelease) {
                await digitalReleaseField.click(); // Check the box if digitalRelease is true
            }

            //click the add button
            const addButton = await page.waitForSelector('button ::-p-text(Add Album)');
            await addButton.click()
            await page.waitForNavigation();
            //get content and split by table rows 
            const content = await page.content();
            const albumEntries = content.split("<tr>").length;
            // verify new album entry
            expect(albumEntries).to.equal(5);
        })
    })
});
