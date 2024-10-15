//imports
const Album = require("../models/Album")
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
//album factory
factory.define("album", Album, {
    artist: () => faker.company.name(),
    album: () => faker.person.jobTitle(),
    condition: () => 
        ['Mint','Very Good','Good','Poor','N/A'][Math.floor(5 * Math.random())],
    rating:() => 2,
    digitalRelease:() => true
    
});
console.log('checkpoint')

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
        await Album.deleteMany({}); //deletes all album records
        await User.deleteMany({}); // deletes all user records   
//create a bew user
        testUser = await factory.create("user", {password: testUserPassword });
        console.log("seed_db: the new user" , testUser)
//cerate 20 album entries linked to user above
        const albums = await factory.createMany("album", 3, { createdBy: testUser._id });
        console.log("3 populated albums:", albums)
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


