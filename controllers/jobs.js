const Job = require("../models/Job")
const parseVErr = require("../utils/parseValidationErrs")

//shows all jobs in table 
const getJobs = async (req, res) => {
//log user not necessary but helpful
    console.log(req.user); 
//fetch all jobs of logged in user
    const jobs = await Job.find({ createdBy: req.user._id }); 

 
//render jobs.ejs view
    res.render("jobs", { jobs }); 
};

//renders new job form
const newJob = async (req, res) => {
    res.render("job", {job:null})
}

//Add job button @bottom of newJob form
const addJob = async (req, res) => {
    try {
        console.log("Raw input:", req.body);
        console.log("Sanitized Input:", "\nCompnay Field:" , req.body.company, "\nPosition Field:", req.body.position, "\nStatus Field:", req.body.status)
//prepare the job data
        const jobData = {
            company: req.body.company,
            position: req.body.position,
            status: req.body.status,
            createdBy: req.user._id,
        };
//use Job model to create new entry w/ JobData object from above
        const newJob = await Job.create(jobData)
//send user back to all jobs page
        res.redirect("/jobs")
//if error occurs creating new entry
    } catch (error) {
        console.error(error);
        const validationErrors = parseVErr(error);
        res.render("Job", { job: null, errors: validationErrors });
    }
};

//renders edit job form
const editJob = async (req, res) => {
//destructure job ID, extracts id from request parameters
    const {id} = req.params;
//use Job model to find job by id, then store in job variable
    const job = await Job.findById(id);
//renders the job view, pass job object to the view 
//this will populate form field with existing data
    res.render("job", {job} )
}

//Update Job Button @bottom of editJob form
const updateJob = async (req, res) => {
    try{
    const {id} = req.params;
    const jobData = {
        company: req.body.company,
        position: req.body.position,
        status: req.body.status,
        createdBy: req.user._id,
    }
    const updatedJob = await Job.findByIdAndUpdate(id, jobData, {new: true});
// Just in case , maybe this should be in editJob function?
    if (!updatedJob){
        return res.status(404).send("Job not Found")
    }

    res.redirect("/jobs");
    }catch (error) {
        console.error(error);
        const validationErrors = parseVErr(error);

        res.render("job", { job: {...req.body, id}, errors: validationErrors });
}
};

const deleteJob = async (req, res) => {
    const {id} = req.params;
    try {
//delete job by id
        const deletedJob = await Job.findByIdAndDelete(id);
//check if the job was found and deleted
        if (!deletedJob){
            return res.status(404).send("Job not Found")
        }
//if job did delete, send user back to jobs page
        res.redirect("/jobs");
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}

module.exports = {
    getJobs,
    addJob,
    newJob,
    editJob,
    updateJob,
    deleteJob
};