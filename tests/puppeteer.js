const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword, factory } = require("../utils/seed_db");
const Job = require("../models/Job");
const get_chai = require("../utils/get_chai");

let testUser = null;
let page = null;
let browser = null;

// Launch a Broswer at this time

describe("Jobs-ejs Puppeteer test" , async function () {
    before(async function () {
        this.timeout(10000);
        // browser = await puppeteer.launch()
        browser = await puppeteer.launch({headless: false, slowMo: 15})
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
            this.submit = await page.waitForSelector("button ::-p-text(Logon")
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
    describe("puppeteer job operations", function () {
        it("TEST 1 should click VIEW JOBS and confirm 4 entries", async () => {
            const { expect } = await get_chai();
            //find the button
            const viewJobsLink = await page.waitForSelector('a ::-p-text(VIEW JOBS)')
            //click the button
            await viewJobsLink.click();
            await page.waitForNavigation();
            //get the page content
            const content = await page.content();
            //count jobs aka <tr>s
            const jobEntries = content.split("<tr>").length;
            // confirm target number
            expect(jobEntries).to.equal(4);
        })
        it("TEST 2 should click add jobs, verify form, resolve fields", async () => {
            const { expect } = await get_chai();

            //wait for add job button
            const addJobButton = await page.waitForSelector('a ::-p-text(Add New Job)');

            // click the add button
            await addJobButton.click();
            await page.waitForNavigation()

            //verify it is the add job form 3 parts 
            //1st find the selector <h2>  Add Job
            const AddJobHeading = await page.waitForSelector('h2 ::-p-text(Add Job)');
            //2nd store text from h1 heading in a variable
            const headingText = await AddJobHeading.evaluate(el => el.textContent);
            //3rd expoect
            expect(headingText).to.include("Add Job");
            
            //Resolve (find) Comp/pos fields and add butn
            const companyField = await page.waitForSelector('input[name="company"]');
            const positionField = await page.waitForSelector('input[name="position"]');
            const addButton = await page.waitForSelector('button ::-p-text(Add Job)');

            //assert that comp/pos/addbuttn are not null
            expect(companyField).to.not.be.null;
            expect(positionField).to.not.be.null;
            expect(addButton).to.not.be.null;
        })
        it("TEST 3 should add a new job and verify on job list", async () => {
            const { expect } = await get_chai()
            

            //create the new job
            const newJobData = await factory.build("job");

            //type company as field value
            const companyField = await page.waitForSelector('input[name="company"]');
            await companyField.type(newJobData.company)
           
            //type position as field value
            const positionField = await page.waitForSelector('input[name="position"]');
            await positionField.type(newJobData.position)
          
            //click the add button
            const addButton = await page.waitForSelector('button ::-p-text(Add Job)');
            await addButton.click()
            await page.waitForNavigation();
            //get content and split by table rows 
            const content = await page.content();
            const jobEntries = content.split("<tr>").length;
            // verify new job entry
            expect(jobEntries).to.equal(5);
        })
    })
});
