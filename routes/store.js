const express = require('express');

const {getProducts} = require('../models/product');
const { getStoreImage}   = require('../models/store');
const router = express.Router();

router.get('/', async (req, res, next) => {
    const name = req.query.name;
    /*if(!name) {
        return res.redirect('/');
    } */
    try {
        const query=`
            MATCH (c:Customer)-[:BoughtAt]->(s:Store {name: $storeName})-[:SELLS]->(p:Product)
            with COLLECT(DISTINCT p.productName) as products UNWIND products AS pName MATCH (c:Customer)-[:BoughtAt]->(s:Store {name: $storeName})-[:SELLS]->(p{productName:pName})
            RETURN pName, count(c) as customerCount order by customerCount desc limit 3
        `;
        const query2=`MATCH (s:Store{name: $storeName}) RETURN s.img as img`
        const products = await getProducts(query, name);
        const img = await getStoreImage(query2, name);
        console.log("img-ss");
        console.log(img);
        return res.render('store', {
            title: `${name}`,
            products,
            img
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;