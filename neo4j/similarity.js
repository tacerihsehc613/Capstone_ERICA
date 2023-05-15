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
    MATCH (s:Customer_Similar), (c:Customer)
    WHERE s.identity = $identity AND s.identity=c.identity
    RETURN c.identity as identity,c.lastname as lastname,s.w0 as w0,s.w1 as w1,s.w2 as w2,s.w3 as w3,s.w4 as w4,s.w5 as w5,s.w6 as w6,s.w7 as w7,s.w8 as w8
`;
const query2 = `
    MATCH (s:Store) 
    WHERE s.storeId IN $identityList
    RETURN s.storeId as storeId, s.name as name, s.img as img
`;

const identity=0;
const regex = /\d+/g;  

const identityList = [237, 71, 59];
const params = {
    identityList: identityList
};

session.run(query, { identity: neo4j.int(identity) })
    .then(result => {
        result.records.forEach(record => {
            const identity = record.get('identity');
            const lastname = record.get('lastname');
            const w0 = record.get('w0'); 
            const w1 = record.get('w1');
            const w2 = record.get('w2');
            const w3 = record.get('w3');
            const w4 = record.get('w4');
            const w5 = record.get('w5');
            const w6 = record.get('w6');
            const w7 = record.get('w7');
            const w8 = record.get('w8');
            const matches = w0.match(regex);  
            const numbers = matches.map(match => Number(match));
            console.log(numbers);
            console.log(typeof(numbers));
            console.log(numbers[0]);
            console.log(typeof(w0));

            console.log(`identity: ${identity}, lastname: ${lastname}, w0: ${w0}, w1: ${w1}, w2: ${w2}, w3: ${w3}, w4: ${w4}, w5: ${w5}, w6: ${w6}, w7: ${w7}, w8: ${w8}`);
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        session.close();
    });

const session2 = driver.session(); 
session2.run(query2, params)
.then(result => {
    result.records.forEach(record => {
        const storeId = record.get("storeId");
        const name = record.get("name");
        const img = record.get("img");
        console.log(`${storeId}: ${name} : ${img}`);
    });
    //console.log(result);
})
.catch(error => {
    console.error(error);
  })
.finally(() => {
    session2.close();
    driver.close();
});

async function getSimilarStore(query, identity) {
    const driver= createDriver();
    const session = driver.session();
        try {
            const params = {
                identityList: identityList
            };
            const result = await session.run(query, { identity: neo4j.int(identity) });
            const record = result.records[0]; // Get the first record
            const data = {
                identity: record.get('identity').toNumber(),
                lastname: record.get('lastname'),
                w0: record.get('w0'),
                w1: record.get('w1'),
                w2: record.get('w2'),
                w3: record.get('w3'),
                w4: record.get('w4'),
                w5: record.get('w5'),
                w6: record.get('w6'),
                w7: record.get('w7'),
                w8: record.get('w8')
            };
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

async function getSimilarStoreInfo(query, identityList) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query2, identityList);
        const records = result.records.map(record => ({
            storeId: record.get("storeId").toNumber(),
            name: record.get('name'),
            img: record.get('img')
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
} 

module.exports = {getSimilarStore, getSimilarStoreInfo};