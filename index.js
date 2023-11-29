const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000
// middleware
app.use(cors())
app.use(express.json())
// const user = process.env.DB_USER
// console.log(user);
// const pass =process.env.DB_PASS
// console.log(pass);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pii6nyx.mongodb.net/?retryWrites=true&w=majority`;

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
        const appertmentCollection = client.db("lakeviewDB").collection("data");
        const userCollection = client.db("lakeviewDB").collection("users");
        const agreementCollection = client.db("lakeviewDB").collection("agreements");
        const announcementsCollection = client.db("lakeviewDB").collection("announcements");
        const couponCollection = client.db("lakeviewDB").collection("coupon");
        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20h' })
            res.send({ token })
        })
        // apartments related api
        app.get('/apartments', async (req, res) => {
            const result = await appertmentCollection.find().toArray();
            res.send(result)
        })
        // for agreements
        app.post("/agreements", async (req, res) => {
            const agreementData = req.body;
            const result = await agreementCollection.insertOne(agreementData);
            res.send(result);
        });
        app.get('/agreements', async (req, res) => {
            const result = await agreementCollection.find().toArray();
            res.send(result)
        })
        // for user
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "user already exists", insertedId: null });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        });
        // 
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.patch('/users/member/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'member'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })
        // for announcement
        app.post('/announcements', async (req, res) => {
            const announcement = req.body;
            const result = await announcementsCollection.insertOne(announcement);
            res.send(result);
        })
        app.get('/announcements', async (req, res) => {
            const result = await announcementsCollection.find().toArray();
            res.send(result)
        })
        // for coupon
        app.post('/coupon', async (req, res) => {
            const coupon = req.body;
            const result = await couponCollection.insertOne(coupon);
            res.send(result);
        })
        app.get('/coupon', async (req, res) => {
            const result = await couponCollection.find().toArray();
            res.send(result)
        })
        // agrement
        // app.get()
        app.patch('/agreement/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: 'checked'
                }
            }
            const result = await agreementCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful c onnection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})