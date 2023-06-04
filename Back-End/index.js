const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/products");
const User = require("./models/users");
const Purchase = require("./models/purchase");
const request = require("request");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const URL = process.env.URL;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://sivanandus2003:Nandu%402003@cluster0.z3yl9ox.mongodb.net/fullStack?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Mongo Connection established");
  })
  .catch((err) => {
    console.log("Mongo connection error: ");
    console.log(err);
  });

//------------------------------------------------------- HOME PAGE -------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    result: "success",
  });
});

//------------------------------------------------------ PRODUCTS ---------------------------------------------------------

app.get("/products", async (req, res) => {
  console.log("From API - /products");
  const products = await Product.find({});
  res.send(products);
});

app.get("/products/product/:id", async (req, res) => {
  console.log("From API - /products/product/:id");
  const { id } = req.params;
  const product = await Product.findById(id);
  res.json(product);
});

app.get("/products/product", async (req, res) => {
  var productCategory = "";
  var priceRange = "";
  productCategory = req.query.category;
  priceRange = req.query.Pricerange.split(":");
  var priceStart = priceRange[0];
  var priceEnd = priceRange[1];
  const product = await Product.find({
    category: productCategory,
    price: { $gte: priceStart },
    price: { $lte: priceEnd },
  });
  res.json({
    result: product,
  });
});

app.post("/products/product", async (req, res) => {
  console.log("From API - /products/product : POST");
  console.log("req.body : ", req.body);
  var product = new Product(req.body);
  console.log(product);
  await product
    .save()
    .then((item) => {
      res.json({ result: "success" });
    })
    .catch((err) => {
      console.log("Error : " + err.message);
      res.status(400).send("unable to save");
    });
});

//------------------------------------------------------ USERS -------------------------------------------------------

app.get("/users", async (req, res) => {
  console.log("From API - /users");
  const users = await User.find({});
  res.json({
    result: "success",
    users: users,
  });
});

app.get("/users/:id", async (req, res) => {
  console.log("From API - /users/:id");
  const user = await User.find({ username: req.params.id });
  if (user == null) {
    res.status(400).send("Wrong username/password");
  } else {
    res.json(user);
  }
});

app.post("/users", async (req, res) => {
  console.log("From API - /users");
  if (req.body.password.length < 8 || req.body.password.al) {
    return res.json({ result: "Password" });
  }
  var user = new User(req.body);
  await user
    .save()
    .then((item) => {
      res.json({ message: "User saved successfully", result: "success" });
    })
    .catch((err) => {
      console.log("Error : " + err.message);
      res.json({result: "username"});
    });
});

app.put("/users/:id", async (req, res) => {
  console.log("From /users - PUT");
  const data = req.body;
  let balance = data.balance + data.amount;
  let update = await User.updateOne(
    { username: req.params.id },
    { $set: { balance: balance } }
  );
  const details = await User.find({ username: req.params.id });
  res.json({
    newBalance: details[0].balance,
  });
});

//-------------------------------------------- PURCHASE --------------------------------------------------

app.post("/purchase", async (req, res) => {
  console.log("FROM /purchase - API POST");
  const details = req.body;

  let data_user;
  request(`${URL}/users/${details.username}`, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      data_user = JSON.parse(body);

      let data_product;
      request(
        `${URL}/products/product/${details.itemId}`,
        function (error, response, body) {
          if (!error && response.statusCode === 200) {
            data_product = JSON.parse(body);

            if (data_user === null || data_product === null) {
              res.json({
                result: "Not Found",
              });
            } else {
              var able = false;
              if (data_user[0].balance >= data_product.price) {
                able = true;
              }
              res.json({
                user: data_user[0].name,
                balance: data_user[0].balance,
                price: data_product.price,
                stock: data_product.stock,
                enough_balance: able,
              });
            }
          }
        }
      );
    }
  });
});

app.put("/purchase", async (req, res) => {
  console.log("From /purchase - PUT ");
  const details = req.body;
  console.log(details);
  let data_user;
  request(
    `${URL}/users/${details.username}`,
    async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        data_user = JSON.parse(body);
        console.log(data_user);

        let data_product;
        request(
          `${URL}/products/product/${details.itemId}`,
          async function (error, response, body) {
            if (!error && response.statusCode === 200) {
              data_product = JSON.parse(body);

              let newBalance = data_user[0].balance - data_product.price;
              let username = data_user[0].username;
              let userUpdate = await User.updateOne(
                { username: username },
                { $set: { balance: newBalance } }
              );
              let newStock = data_product.stock - 1;
              let id = data_product._id;
              let productUpdate = await Product.updateOne(
                { _id: id },
                { $set: { stock: newStock } }
              );

              res.json({
                user: data_user[0].name,
                balance: data_user[0].balance,
                price: data_product.price,
                stock: data_product.stock,
                newBalance: newBalance,
                newStock: newStock,
              });
            }
          }
        );
      }
    }
  );
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Listening on port 3001");
});
