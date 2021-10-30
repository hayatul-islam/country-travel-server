const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5050;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9gms.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("countryTravels");
        const travelsCollection = database.collection("travels");
        const ordersCollection = database.collection("orders");

        // all travels
        app.get('/travels', async (req, res) => {
            const cursor = await travelsCollection.find({}).toArray();
            res.send(cursor)
        });

        // orders 
        app.post('/orders', async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.json(result)
        });

        // read all orders
        app.get('/allOrders', async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        // order delete 
        app.delete('/delete/:id', async (req, res) => {

            const query = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        // update status
        app.put('/update/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const updateUser = req.body;
            updateUser.status = 'Approved'

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    status: updateUser.status,

                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // add a new travel 
        app.post('/addTravel', async (req, res) => {
            const newTravel = await travelsCollection.insertOne(req.body);
            console.log(newTravel);
            res.json(newTravel)
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`)
})