const neo4j = require('neo4j-driver');

function createDriver() {
  const driver = neo4j.driver(
    'neo4j+s://gdb-q1nuq4z96jlkvbkvnhvd.graphenedb.com:24786',
    neo4j.auth.basic('neo4j', 'Jay2833748!')
  );
  return driver;
}

/* const driver = neo4j.driver(
    'neo4j+s://gdb-q1nuq4z96jlkvbkvnhvd.graphenedb.com:24786',
    neo4j.auth.basic('neo4j', 'Jay2833748!')
); */

const driver2 = createDriver();
const session = driver2.session();
const query = `
MATCH (c:Customer)-[:ORDERED]->(:Product)<-[:SELLS]-(s:Store)
  WITH c.customerId AS customerId, COLLECT(DISTINCT s.storeId) AS storeIds
  RETURN COLLECT({
    customerId: customerId,
    storeNum: size(storeIds),
    storeIds: storeIds
  }) AS customerStoreList
  LIMIT 5`;

/* session
  .run(query)
  .then(result => {
    result.records.forEach(record => {
      console.log(record.get('n').properties);
    });
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    session.close();
    driver.close();
  }); */
  /* session
  .run(query)
  .then(result => {
    result.records.forEach(record => {
      console.log(record.get('customerStoreList'));
    });
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    session.close();
    driver.close();
  }); */

  session
  .run(`MATCH (c:Customer)-[:ORDERED]->(:Product)<-[:SELLS]-(s:Store)
         WITH c.customerId AS customerId, COLLECT(DISTINCT s.storeId) AS storeIds
         RETURN COLLECT({
           customerId: customerId,
           storeNum: size(storeIds),
           storeIds: storeIds
         }) AS customerStoreList
         LIMIT 5`)
  .then(result => {
    result.records.forEach(record => {
      const customerStoreList = record.get('customerStoreList');
      /* customerStoreList.forEach(customerStore => {
        console.log(`CustomerId: ${customerStore.customerId}`);
        console.log(`StoreNum: ${customerStore.storeNum}`);
        console.log(`StoreIds: ${customerStore.storeIds}`);
      }); */

      customerStoreList.slice(0, 5).forEach(customerStore => {
        console.log(`CustomerId: ${customerStore.customerId}`);
        console.log(`StoreNum: ${customerStore.storeNum}`);
        console.log(`StoreIds: ${customerStore.storeIds}`);
      });

    });
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    session.close();
    driver2.close();
  });


  async function getCustomerStoreList() {
    const driver= createDriver();
    const session = driver.session();
  
    const query = `
      MATCH (c:Customer)-[:ORDERED]->(:Product)<-[:SELLS]-(s:Store)
      WITH c.customerId AS customerId, COLLECT(DISTINCT s.storeId) AS storeIds
      RETURN COLLECT({
        customerId: customerId,
        storeNum: size(storeIds),
        storeIds: storeIds
      }) AS customerStoreList
      LIMIT 5`;
  
    try {
      const result = await session.run(query);
      const customerStoreList = result.records.map(record => record.get('customerStoreList'));
      return customerStoreList;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      session.close();
      driver.close();
    }
  }
  
  getCustomerStoreList().catch(console.error);

// When the application is shutting down:
// Close the driver
//const driver = createDriver();

  module.exports = { getCustomerStoreList };
  
  //driver.close();
 