const neo4j = require('neo4j-driver');

function createDriver() {
    const driver = neo4j.driver(
        'neo4j+s://21f49612.databases.neo4j.io',
        neo4j.auth.basic('neo4j', 'Jay2833748!')
    );
    return driver;
}

const driver = createDriver();
const session = driver.session();


//각 store별로 가장 많이 구매한 상품 3개
const query=`
    MATCH (c:Customer)-[:BoughtAt]->(s:Store {name: $storeName})-[:SELLS]->(p:Product)
    with COLLECT(DISTINCT p.productName) as products UNWIND products AS pName MATCH (c:Customer)-[:BoughtAt]->(s:Store {name: $storeName})-[:SELLS]->(p{productName:pName})
    RETURN pName, count(c) as customerCount order by customerCount desc limit 3
`;

const storeName="진로집"

session.run(query, { storeName: storeName })
    .then(result => {
        result.records.forEach(record => {
            const pName = record.get('pName');
            const customerCount = record.get('customerCount');
            console.log(`pName: ${pName}, customerCount: ${customerCount}`);
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        session.close();
        driver.close();
    });

async function getProducts(query, storeName) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, storeName);
        const records = result.records.map(record => ({
            pName: record.get(pName),
            customerCount: record.get('customerCount').toNumber()
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
} 

module.exports = {getProducts};