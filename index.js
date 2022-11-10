const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
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
    // create an array of documents to insert
    // const docs = [
    //   {
    //     title: "Wildlife Photography",
    //     price: 500,
    //     thumbnail: "https://i.ibb.co/ZTHVTqf/wildlife-photography.jpg",
    //     rating: 5,
    //     description:
    //       "The genre of photography that focuses on animals and their natural habitat is called wildlife photography. Animal behaviors in wild are also capture by wildlife photographer. Mostly these pictures are captured to be printed in journals or exhibitions. Many people practice this type of photography. Apart from a good camera, several lens, strong flashlight, you need patience to click the right picture.",
    //   },
    //   {
    //     title: "Sports / Action Photography",
    //     price: 300,
    //     thumbnail: "https://i.ibb.co/m0dqTgH/sports-photography.jpg",
    //     rating: 4.8,
    //     description:
    //       "This genre of photography specializes in capturing a decisive moment in an event of sports. Sports photography is one of the difficult types of photography. It requires practice along with the various equipments.",
    //   },
    //   {
    //     title: "Portrait Photography",
    //     price: 200,
    //     thumbnail: "https://i.ibb.co/pj1X6ZP/portrait-photography.jpg",
    //     rating: 4.5,
    //     description:
    //       "One of the oldest types of photography is portrait photography. It can range from shooting your family members to friends to pets. It is often called portraiture and this type of photographer abounds.",
    //   },
    //   {
    //     title: "Wedding Photography/Event Photography",
    //     price: 250,
    //     thumbnail: "https://i.ibb.co/ZfTwPKF/wedding-event-photography.jpg",
    //     rating: 4.7,
    //     description:
    //       "It is said that a newcomer in professional photography begins his/her career by practicing a wedding or event photography. But that does not mean that this type of photographer does not require and any skill. A person dealing in this type of photography has to be an expert in portraiture and extremely good editing skills. The demand for wedding photography or event photography is more.",
    //   },
    //   {
    //     title: "Fashion Photography",
    //     price: 300,
    //     thumbnail: "https://i.ibb.co/Fnw0Ckh/fashion-photography.jpg",
    //     rating: 4.9,
    //     description:
    //       "Fashion photography captures models in a glamorous light display fashion items such as clothes, shoes and other accessories. This type of photography is conducted mostly for advertisements and fashion magazines.",
    //   },
    //   {
    //     title: "Nature Photography",
    //     price: 250,
    //     thumbnail: "https://i.ibb.co/Qpb2gcK/nature-photography.jpg",
    //     rating: 5,
    //     description:
    //       "Natural photography comprises of pictures of nature as viewed from the eyes of the photographer. Contrary to what many people believe, nature photography is not only restricted to capturing the images of trees and plants, but rather includes any outdoor natural aspect including hills, water bodies and even the sky.",
    //   },
    // ];
    // const options = { ordered: true };
    // const result = await serviceCollection.insertMany(docs, options);
    // console.log(result);

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
    app.get("/myreviews/:id", async (req, res) => {
      const reviewerUid = req.params.id;

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
  console.log("server is running", port);
});
