require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express();
const {
  MongoClient,
  ServerApiVersion
} = require('mongodb');

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nss4adm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // collections
    const productCollection = client.db('baishakhiShop').collection('products');
    const categoriesCollection = client.db('baishakhiShop').collection('categories');
    const brandCollection = client.db('baishakhiShop').collection('brands')

    app.use('/categoires', async (req, res) => {
      result = await categoriesCollection.find().toArray();
      res.json(result)
    })

    app.use('/brands', async (req, res) => {
      result = await brandCollection.find().toArray();
      res.json(result)
    })

    app.get('/products', async (req, res) => {
      const {
        page = 1, limit = 9, keyword = '', brand = '', category = '', minPrice = 0, maxPrice = Infinity, sort = ''
      } = req.query;

      try {
        const query = {};
        // product search
        if (keyword) { query.productName = { $regex: keyword, $options: 'i'}}
        // brand filtering
        if (brand) {query.brandName = {$regex: brand, $options: 'i'}}
        // category filtering
        if (category) {query.productCategory = {$regex: category, $options: 'i'}}
        // price filtering
        let min = parseFloat(minPrice);
        let max = parseFloat(maxPrice);
        if (!isNaN(min) && !isNaN(max)) {
          query.productPrice = { $gte: min, $lte: max}
        } else if (!isNaN(min))
          {query.productPrice = {$gte: min}
        } else if (!isNaN(max))
          { query.productPrice = { $lte: max}
        }

        // Sorting options
        let sortOption = {};
        if (sort === 'priceAsc') {
          sortOption.productPrice = 1;
        } else if (sort === 'priceDesc') {
          sortOption.productPrice = -1;
        } else if (sort === 'dateDesc') {
          sortOption.productStoreDate = -1;
        }

        const products = await productCollection.find(query).sort(sortOption).skip((page - 1) * limit).limit(parseInt(limit)).toArray();
        const total = await productCollection.estimatedDocumentCount(query);

        res.json({
          products,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          foundProduct: products.length
        });
      } catch (err) {
        res.status(500).json({
          error: err.message
        });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Welcome to Baishakhi Shop")
})

app.listen(port, () => {
  console.log(`Baishakhi server is running on ${port}`);
})