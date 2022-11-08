const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9qpmxm2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const packagesCollection = client.db('travelonthego').collection('packages')

        app.get('/packages', async (req, res) => {
            const query = {};
            const cursor = packagesCollection.find(query);
            const packages = await cursor.toArray();
            res.send(packages);
        })
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