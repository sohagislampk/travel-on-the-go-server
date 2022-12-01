const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//Middle Were
app.use(cors())
app.use(express.json())

//MongoDB uri and Client strat

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9qpmxm2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//verify JWT function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    if (!authHeader) {
        return res.status(401).send({ message: 'Unathorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (er, decoded) {
        if (er) {
            return res.status(403).send({ message: 'Forbidden Acces ' });
        }
        req.decoded = decoded;
        next()
    })
}



async function run() {
    try {
        const packagesCollection = client.db('travelonthego').collection('packages')
        const reviewCollection = client.db('travelonthego').collection('reviews')
        //create jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })
        //packages API
        app.get('/packages', async (req, res) => {
            let query = {};
            const cursor = packagesCollection.find(query).sort({ "_id": -1 });
            if (req.query.limit) {
                const size = parseInt(req.query.limit)
                const packages = await cursor.limit(size).toArray();
                res.send(packages);
                return
            }
            const packages = await cursor.toArray();
            res.send(packages);
        });
        app.get('/compare', async (req, res) => {
            const id1 = req.query.a;
            const id2 = req.query.a;
            const query1 = { _id: ObjectId(id1) }
            const query2 = {
                _id: ObjectId(id2)
            }
            console.log(req.query.a);
            console.log(req.query.b);

            const result = await packagesCollection.find({ _id: { $eq: { ObjectId(id1), ObjectId(id2) } } }).toArray()
            res.send(result)
        })
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await packagesCollection.findOne(query);
            res.send(tourPackage);
        })

        app.post('/addpackages', verifyJWT, async (req, res) => {
            const tourPackage = req.body;
            const result = await packagesCollection.insertOne(tourPackage);
            res.send(result);
        });
        //review Api

        app.get('/reviews/:id', async (req, res) => {
            let id = req.params.id;
            const query = { package: id }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized access' })
            }
            let query = {};
            if (req.query.email) {
                query = {
                    writerEmail: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({ "time": -1 })
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        app.post('/reviews', verifyJWT, async (req, res) => {
            const addedReview = req.body;
            const review = await reviewCollection.insertOne(addedReview);
            res.send(review);
        });

        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });
        app.get('/updatereview/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });
        app.patch('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updateReview = {
                $set: req.body
            }
            const result = await reviewCollection.updateOne(query, updateReview);
            res.send(result);
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