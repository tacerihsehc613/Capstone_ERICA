const neo4j = require('neo4j-driver');

function createDriver() {
    const driver = neo4j.driver(
      'neo4j+s://b2036ca7.databases.neo4j.io',
      neo4j.auth.basic('neo4j', 'niax1729@')
    );

    return driver;
  }

/* const driver = neo4j.driver(
    'neo4j+s://gdb-q1nuq4z96jlkvbkvnhvd.graphenedb.com:24786',
    neo4j.auth.basic('neo4j', 'Jay2833748!')
); */

const driver = createDriver();
const session = driver.session();

const limit = 6; // the limit value can be set to any number you want

const query = `
    MATCH (n:Review)
    RETURN n.store, n.address, n.text, n.pagerank as pg
    ORDER BY pg DESC
    LIMIT $limit
`;


session.run(query, { limit: neo4j.int(limit) })
    .then(result => {
        result.records.forEach(record => {
            const store = record.get('n.store');
            const address = record.get('n.address');
            const text = record.get('n.text');
            const pagerank = record.get('pg');

            console.log(`Store: ${store}, Address: ${address}, Text: ${text}, PageRank: ${pagerank}`);
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        session.close();
        driver.close();
    });

async function getRecords(query, limit) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { limit: neo4j.int(limit) });
        const records = result.records.map(record => ({
            store: record.get('n.store'),
            address: record.get('n.address'),
            text: record.get('n.text'),
            pagerank: record.get('pg')
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
}
      
      
module.exports = getRecords;