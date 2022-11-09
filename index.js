const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9qpmxm2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const packagesCollection = client.db('travelonthego').collection('packages')
        const reviewCollection = client.db('travelonthego').collection('reviews')

        app.get('/packages', async (req, res) => {
            const query = {};
            const cursor = packagesCollection.find(query);
            const packages = await cursor.toArray();
            res.send(packages);
        });
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await packagesCollection.findOne(query);
            res.send(tourPackage);
        })

        app.post('/addpackages', async (req, res) => {
            const tourPackage = req.body;
            const result = await packagesCollection.insertOne(tourPackage);
            res.send(result);
        });
        app.post('/reviews', async (req, res) => {
            const addedReview = req.body;
            const review = await reviewCollection.insertOne(addedReview);
            res.send(review);
        });
    }
    finally {

    }
}
run().catch(error => console.error(error));

app.get('/', (req, res) => {
    res.send('Travel On The Go Server Is Running')
})


app.listen(port, () => {

})