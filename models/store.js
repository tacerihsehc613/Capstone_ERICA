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

const query=`
    match (s:Store {name: $storeName}) SET s.img=$img
    return s.name as name,s.img as img
`;

const storeName="군자네";
const img= '/img/mel41679844402840.jpeg';
/* session.run(query, { storeName: storeName, img: img })
    .then(result => {
        result.records.forEach(record => {
            const name = record.get('name');
            const img = record.get('img');
            console.log(`name: ${name}, img: ${img}`);
        });
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => {
        session.close();
        driver.close();
    }); */

async function setStoreImage(query, storeName, img) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { storeName: storeName, img: img });
        const records = result.records.map(record => ({
            name: record.get('name'),
            img: record.get('img')
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
} 

module.exports = {setStoreImage};