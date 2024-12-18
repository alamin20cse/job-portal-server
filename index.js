const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// 
// 

// Initialize the app
const app = express();

// Middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true,


}));
app.use(express.json());
app.use(cookieParser());



// function

const logger=(req,res,next)=>{
  console.log('logggggger');
  next();

}

const verifyToken=(req,res,next)=>{
  // console.log('Inside the ve ryfiy ',req.cookies);

  const token=req.cookies?.token;
  if(!token)
  {
    return res.status(401).send({message:'Unauthorize access'})
  }

  jwt.verify(token,process.env.JWT_SECTET,(error,decoded)=>{

    if(error)
    {
      return res.status(401).send({message:'unAuthorize Acces'})
    }

    next();

  })


  


}








const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.uslpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");




const JobsCollection=client.db('JobCollection').collection('jobs');
const JobApplicationCollection=client.db('JobCollection').collection('job-application');


// Auth releated
app.post(  '/jwt',async(req,res)=>{
const user=req.body;
const token=jwt.sign(user,process.env.JWT_SECTET,{expiresIn:'1h'});
res
.cookie('token',token,{
  httpOnly:true,
  secure:false,

  


})
.send({success:true});

})










// jobs releated Api
app.get('/jobs',logger, async(req,res)=>{

  console.log('appi sice callback');
  const  email=req.query.email;
  let quary={};
  if(email)
  {

    quary={hr_email:email}

  }


  const cursor=JobsCollection.find(quary);
  const result=await cursor.toArray();
  res.send(result);


})


// spacific id of jobs

app.get('/jobs/:id',async(req,res)=>{
  const id=req.params.id;
  const quary={_id:new ObjectId(id)}
  const result=await JobsCollection.findOne(quary);
  res.send(result);
})

app.post('/jobs',async(req,res)=>{
  const newJob=req.body;
  const result=await JobsCollection.insertOne(newJob);
  res.send(result);





})









// some jobs 
app.get('/job-application',verifyToken, async(req,res)=>{
  const email=req.query.email;
  const quary={applican_email:email}


  // console.log("cookkkies",req.cookies)








  const result=await JobApplicationCollection.find(quary).toArray();
  // res.send(result);

  // fokira  

  for(const application of result)
  {

    console.log(application.job_id);
    const quary1={_id:new ObjectId(application.job_id)};
    const job=await JobsCollection.findOne(quary1);
    if(job)
    {
      application.title=job.title;
      application.company=job.company;
      application.company_logo=job.company_logo;
    }

    
  }
  res.send(result)


});


// job applicatnt


app.get('/job-application/jobs/:job_id',async(req,res)=>{
  const jobId=req.params.job_id;
  const quary={job_id:jobId}
  const result=await JobApplicationCollection.find(quary).toArray()
  res.send(result);
})

// job applicant api

app.post('/job-application',async(req,res)=>{
  const application=req.body;
  const result=await JobApplicationCollection.insertOne(application);
  res.send(result);

})








  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send("Job server is connected"); // Fixed typo: changed req.send to res.send
});

app.listen(port, () => {
    console.log(`Job server is waiting at: ${port}`);
});
