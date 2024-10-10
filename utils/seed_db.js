//imports
const Job = require("../models/Job")
const User = require("../models/User")
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

//Random data definition
const testUserPassword = faker.internet.password();

//Factory definition
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

//defining factories

//job factory
factory.define("job", Job, {
    company: () => faker.company.name(),
    position: () => faker.person.jobTitle(),
    status: () => 
    ["interview", "declined", "pending"][Math.floor(3 * Math.random())],
});

//user factory
factory.define("user", User, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password()
})

//seeding the database
const seed_db = async () => {
    let testUser = null;
    try {
        const mongoURL = process.env.MONGO_URI_TEST;
        await Job.deleteMany({}); //deletes all job records
        await User.deleteMany({}); // deletes all user records   
//create a bew user
        testUser = await factory.create("user", {password: testUserPassword });
        console.log("seed_db: the new user" , testUser)
//cerate 20 job entries linked to user above
        const jobs = await factory.createMany("job", 3, { createdBy: testUser._id });
        console.log("3 populated jobs:", jobs)
    } catch (error) {
        console.log("database error")
        console.log(error.message);
        throw error;
    }
    return testUser;
}

module.exports = {
    testUserPassword,
    factory,
    seed_db,
}


