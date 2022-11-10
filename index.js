const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.port || 5000;

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
  res.send("surver is running new update xxxxxxxxxxxx");
});

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${user}:${password}@cluster0.jx6qumw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(user, password);
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const serviceCollection = client.db("services").collection("service");
    const reviewCollection = client.db("reviews").collection("review");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log("user fuck", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });
      console.log({ token });
      res.send({ token });
    });

    const verifyJWT = (req, res, next) => {
      if (!req.headers.authorization) {
        console.log("before step 1 , authorization is here");
        return res.status(401).send("unauthorised access");
      }
      const token = req.headers.authorization.split(" ")[1];

      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            return res.status(403).send("forbidden access");
          }
          req.decoded = decoded;
          next();
        }
      );
    };

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/servicedetails/:serviceId", async (req, res) => {
      // console.log("hitted");
      const serviceId = req.params.serviceId;
      console.log(serviceId);

      const query = { _id: ObjectId(serviceId) };
      const result = await serviceCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });
    app.post("/addservice", async (req, res) => {
      const service = req.body;
      // console.log(service);
      const result = await serviceCollection.insertOne(service);
      // const result = await serviceCollectiontest.insertOne(service);
      console.log(result);
      res.send(result);
    });
    app.post("/addreview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const serviceId = req.headers.serviceid;

      const query = { serviceId: serviceId };

      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.delete("/removereview/:id", async (req, res) => {
      const reviewId = req.params.id;

      const query = {
        _id: ObjectId(reviewId),
      };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/myreviews/:id", verifyJWT, async (req, res) => {
      const reviewerUid = req.params.id;
      if (req.decoded.userUid != req.params.id) {
        console.log(" unauthorised acces");
        return res.status(403).send("unauthorised access");
      }
      const query = { reviewerUid: reviewerUid };
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.put("/updatereview", async (req, res) => {
      let updateReviewInfo = req.body;
      const {
        _id,
        rating,
        message,
        reviewerName,
        reviewerEmail,
        reviewerUid,
        reviewerPhoto,
        serviceId,
        serviceThumbnail,
        title,
      } = updateReviewInfo;

      updateReviewInfo = {
        rating,
        message,
        reviewerName,
        reviewerEmail,
        reviewerUid,
        reviewerPhoto,
        serviceId,
        serviceThumbnail,
        title,
      };
      const filter = { _id: ObjectId(_id) };

      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: updateReviewInfo,
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is  running,", port);
});
