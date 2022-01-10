const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
const port = process.env.PORT || 500;

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wuxif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.json('CRUD application started successfully!');
})

async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully!');
        const database = client.db("students-corner");
        const studentsCollection = database.collection("students");

        //GET API for students
        app.get('/students', async (req, res) => {
            const pointer = studentsCollection.find({});
            const result = await pointer.toArray();
            console.log('All students retrieved from the database!');
            res.json(result);
        })

        //GET API for student with ID
        app.get('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.findOne(query);
            console.log(`Student with id: ${id} successfully retrieved from the database!`);
            res.json(result);
        })

        // POST API for entering new student data
        app.post('/students', async (req, res) => {
            const name = req.body.name;
            const age = req.body.age;
            const institution = req.body.institution;
            const desc=req.body.desc;
            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64');
            const imageBuffer = Buffer.from(encodedImage, 'base64');
            const studentData = { name: name, age: age, institution: institution,desc:desc, image: imageBuffer };
            const result = await studentsCollection.insertOne(studentData);
            console.log('A new student has been inserted!');
            res.json(result);
        })

        //DELETE API for deleting a student data with student id
        app.delete('/student/:id', async (req, res) => {
            const id = req.params.id;
            const result = await studentsCollection.deleteOne({ _id: ObjectId(id) });
            console.log(`A student with student id: ${id} has been deleted!`);
            res.json(result);
        })

        //UPDATE API for updating a student data with student id
        app.put('/student/:id', async (req, res) => {
            const id = req.params.id;

            //updated information
            const name = req.body.name;
            const age = req.body.age;
            const institution = req.body.institution;
            const desc=req.body.desc;
            
            const studentData = { name: name, age: age, institution: institution, desc:desc};

            const query = { _id: ObjectId(id) };

            const updateDoc = {
                $set: studentData
            };
            const result=await studentsCollection.updateOne(query,updateDoc);
            console.log(`Student with id:${id} has been updated successfully!`);
            res.json(result);
        })

        //UPDATE API for updating picture
        app.put('/updatePicture/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            
            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64');
            const imageBuffer = Buffer.from(encodedImage, 'base64');
            const studentData = { image: imageBuffer };

            const updateDoc = {
                $set: studentData
            };

            const result=await studentsCollection.updateOne(query,updateDoc);
            console.log(`Picture of Student with id:${id} has been updated successfully!`);
            res.json(result);
            
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Go to- http://localhost:${port}`);
})