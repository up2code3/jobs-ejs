const express = require("express")

const router = express.Router()

const {
    getJobs,
    addJob,
    newJob,
    editJob,
    updateJob,
    deleteJob
} = require("../controllers/jobs")

//Routes
router.get("/", getJobs);
router.post("/", addJob);
router.get("/new",newJob);
router.get("/edit/:id",editJob);
router.post("/update/:id", updateJob);
router.post("/delete/:id", deleteJob);

module.exports = router;