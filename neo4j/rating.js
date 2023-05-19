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
    CALL {
        MATCH (c:Customer_INTER)
        WHERE c.from = $identity
        UNWIND keys(apoc.convert.fromJsonMap(c.map)) AS c2_id
        MATCH (c2:Customer)
        WHERE c2.identity = toInteger(c2_id)
        RETURN c2.identity AS c, apoc.convert.fromJsonMap(c.map)[c2_id] AS num, c2.lastname as name, c2.community as community
        UNION ALL
        MATCH (c:Customer_INTER)
        WHERE toString($identity) IN keys(apoc.convert.fromJsonMap(c.map))
        MATCH (customer:Customer {identity: c.from})
        RETURN c.from AS c, apoc.convert.fromJsonMap(c.map)[toString($identity)] AS num, customer.lastname AS name,customer.community as community
    }
    return c,num,name,community
    ORDER BY num DESC limit 3
`;
const query2=`
MATCH (c1:Customer)-[b:BoughtAt]->(s:Store)
WHERE c1.identity IN $cList AND NOT EXISTS {
  MATCH (c2:Customer {identity: $identity})-[:BoughtAt]->(s)
}
RETURN c1.identity,c1.lastname,c1.community,s.storeId, s.name, b.num
ORDER BY b.num DESC limit 3
`;
const identity=7;

const cList = [3487, 79, 601]
const params = {
    identity: neo4j.int(identity),
    cList: cList
};

/*session.run(query, { identity: neo4j.int(identity) })
    .then(result => {
        result.records.forEach(record => {
            const c = record.get('c');
            const num = record.get('num');
            const name = record.get('name');
            const community = record.get('community');
            //console.log(`c: ${c}, num: ${num}, name: ${name}, community: ${community}`);
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
            const c = record.get('c1.identity');
            const cname = record.get('c1.lastname');
            const community = record.get('c1.community');
            const storeId = record.get('s.storeId');
            const name = record.get('s.name');
            const num = record.get('b.num');
            //console.log(`c: ${c}, cname: ${cname}, community: ${community}, storeId: ${storeId}, name: ${name}, num: ${num}`)
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        session2.close();
        driver.close();
    }); */

async function getNeoRecommendationUser(query, identity) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { identity: neo4j.int(identity) });
        const records = result.records.map(record => ({
            c: record.get('c').toNumber(),
            num: record.get('num').toNumber(),
            name: record.get('name'),
            community: record.get('community').toNumber()
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
} 

async function getNeoRecommendationStore(query, identity, cList) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const params = {
            identity: neo4j.int(identity),
            cList: cList
        };
        const result = await session.run(query2, params);
        const records = result.records.map(record => ({
            c: record.get('c1.identity'),
            cname: record.get('c1.lastname'),
            community: record.get('c1.community').toNumber(),
            storeId: record.get('s.storeId').toNumber(),
            name: record.get('s.name'),
            num: record.get('b.num').toNumber()
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
} 

module.exports = {getNeoRecommendationUser, getNeoRecommendationStore};