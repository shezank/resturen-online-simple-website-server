const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://kasmeri-resturent.web.app',
        'https://kasmeri-resturent.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iyzg5.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const userCollection = client.db("Kasmeri_Resturent").collection('users');
        const productCollection = client.db("Kasmeri_Resturent").collection('products');
        const orderCollection = client.db("Kasmeri_Resturent").collection('orders');


        app.get('/', (req, res) => {
            res.send('Welcome To Kasmeri Resturent Server')
        })


        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const result = await productCollection.find()
            .skip(page * size)
            .limit(size)
            .toArray();
            res.send(result);
        })

        app.get('/productsCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount()
            res.send({count});
        })

        app.get('/products/:uid', async (req, res) => {
            const user = req.params.uid;
            const userUid = { userProduct: user };
            const result = await productCollection.find(userUid).toArray();
            res.send(result);
        })

        app.put('/products/:uid', async (req, res) => {
            const uid = req.params.uid;
            const filter = {userProduct: uid};
            const user = req.body; 
            const options = { upsert: true };
            const updateUser = {
                $set: {
                    userProduct: user.userProduct, 
                    foodName: user.foodName, 
                    foodImg: user.foodImg, 
                    foodCategory: user.foodCategory, 
                    quantity: user.quantity, 
                    price: user.price, 
                    orderOwnerName: user.orderOwnerName, 
                    ownerEmail: user.ownerEmail, 
                    country: user.country, 
                    description: user.description
                },
              };
            const result = await productCollection.updateOne(filter, updateUser, options);
            res.send(result);
        })

        app.get('/products/details/:id', async (req, res) => {
            const id = req.params.id;
            const userId = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(userId);
            res.send(result);
        })


        app.post('/products', async (req, res) => {
            const newUser = req.body;
            const result = await productCollection.insertOne(newUser);
            res.send(result);
        })
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            res.send(result);
        })
        app.get('/orders', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const result = await orderCollection.find()
            .skip(page * size)
            .limit(size)
            .toArray();
            res.send(result);
        })

        app.get('/orders/:email', async(req,res)=>{
            const email = req.params.email;
            const query = {orderEmail: email};
            const result = await orderCollection.find(query).toArray();
            res.send(result)
        })
        app.delete('/orders/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})