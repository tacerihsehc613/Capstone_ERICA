const neo4j = require('neo4j-driver');

function createDriver() {
    const driver = neo4j.driver(
        'neo4j+s://b2036ca7.databases.neo4j.io',
        neo4j.auth.basic('neo4j', 'niax1729@')
    );
    return driver;
}

const driver = createDriver();
const session = driver.session();

const limit = 10; // the limit value can be set to any number you want
var graph = {
    nodes : [
    ],
    links : [
    ]
}

const query=`
    match (r:Review)
    return r.identity as id, r.store as store, r.text as text, r.pagerank as pagerank, r.community as community
    order by r.pagerank desc 
    LIMIT $limit
`;
const query2 = `
    MATCH (c:Review)
    WITH c ORDER BY c.pagerank DESC LIMIT $limit
    with COLLECT(c.identity) AS c_ids
    UNWIND c_ids AS c_id with c_id, c_ids
    MATCH (i:Review_INTER) WHERE i.from = c_id
    UNWIND keys(apoc.convert.fromJsonMap(i.map)) AS c2_id
    MATCH (c2:Review) WHERE c2.identity = toInteger(c2_id) AND c2.identity <> c_id and c2.identity in c_ids WITH c_id,  c2_id,apoc.convert.fromJsonMap(i.map)[c2_id] AS weight
    RETURN c_id as from, toInteger(c2_id) as to, weight
`;
const query3 = `
    MATCH (c:Review)
    WITH c ORDER BY c.pagerank DESC LIMIT $limit
    WITH COLLECT(c.identity) AS c_ids
    UNWIND c_ids AS c_id
    WITH c_id, c_ids
    MATCH (i:Review_INTER) WHERE i.from = c_id
    UNWIND keys(apoc.convert.fromJsonMap(i.map)) AS c2_id
    MATCH (c2:Review) WHERE c2.identity = toInteger(c2_id) AND c2.identity <> c_id AND c2.identity IN c_ids
    WITH c_id, c2_id, apoc.convert.fromJsonMap(i.map)[c2_id] AS weight
    MATCH (from:Review {identity: c_id})-[:Include]->(fromKeyword:Keyword)
    MATCH (to:Review {identity: toInteger(c2_id)})-[:Include]->(toKeyword:Keyword)
    WITH c_id AS from, toInteger(c2_id) AS to, weight, COLLECT(DISTINCT fromKeyword.name) AS fromKeywords, COLLECT(DISTINCT toKeyword.name) AS toKeywords
    RETURN from, to, weight, apoc.coll.intersection(fromKeywords, toKeywords) AS commonKeywords
`;

session.run(query, { limit: neo4j.int(limit) })
    .then(result => {
        result.records.forEach(record => {
            const id = record.get('id');
            const store = record.get('store');
            const pagerank = record.get('pagerank');
            const community = record.get('community');
            const node = {
                id: id.toNumber(),
                store: store,
                pagerank: pagerank,
                community: community.toNumber()
              };
            graph.nodes.push(node);
            //console.log(`id: ${id}, store: ${store}, pagerank: ${pagerank}, community: ${community}`);
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        console.log(typeof(graph.nodes[0]));
        console.log("dsf");
        console.log(graph.nodes[0]);
        console.log(graph.nodes[0]['id']);
        console.log(typeof(graph.nodes[0]['store']));
        console.log(typeof(graph.nodes[0]['pagerank']));
        console.log(typeof(graph.nodes[0]['community']));
        session.close();
    });

/*const session2 = driver.session(); 
session2.run(query2, { limit: neo4j.int(limit) })
    .then(result => {
        result.records.forEach(record => {
            const from = record.get('from');
            const to = record.get('to');
            const weight = record.get('weight');
            //console.log(`From: ${from}, To: ${to}, weight: ${weight}`);
            const link = {
                source: from.toNumber(),
                target: to.toNumber(),
                weight: weight.toNumber()
            };
            //console.log(from.toNumber(), to.toNumber(), weight.toNumber());
            graph.links.push(link);
        });
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => {
        /* console.log("Sdfd");
        console.log(graph.links);
        console.log(typeof(graph.links)); 
        session2.close();
        driver.close();
    }); */

    const session3 = driver.session(); 
    session3.run(query3, { limit: neo4j.int(limit) })
        .then(result => {
            result.records.forEach(record => {
                const from = record.get('from');
                const to = record.get('to');
                const weight = record.get('weight');
                const commonKeywords = record.get('commonKeywords');
                /* console.log(`From: ${from}, To: ${to}, weight: ${weight}, commonKeywords: ${commonKeywords}`);
                console.log(typeof(commonKeywords[0]));
                console.log(typeof(from.toNumber())); */
                const link = {
                    source: from.toNumber(),
                    target: to.toNumber(),
                    weight: weight.toNumber(),
                    commonKeywords: commonKeywords
                };
                //console.log(from.toNumber(), to.toNumber(), weight.toNumber());
                graph.links.push(link);
            });
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            console.log("Sdfd");
            console.log(graph.links);
            console.log(typeof(graph.links)); 
            session3.close();
            driver.close();
        });

async function getNodeRecords2(query, limit) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { limit: neo4j.int(limit) });
        const records = result.records.map(record => ({
            id: record.get('id').toNumber(),
            text: record.get('text'),
            store: record.get('store'),
            pagerank: record.get('pagerank'),
            community: record.get('community').toNumber()
        }));
            return records;
    } catch (error) {
        return Promise.reject(error);
    }
}
    
async function getEdgeRecords2(query, limit) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { limit: neo4j.int(limit) });
        const records = result.records.map(record => ({
            source: record.get('from').toNumber(),
            target: record.get('to').toNumber(),
            weight: record.get('weight').toNumber()
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getEdgeRecords3(query, limit) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { limit: neo4j.int(limit) });
        const records = result.records.map(record => ({
            source: record.get('from').toNumber(),
            target: record.get('to').toNumber(),
            weight: record.get('weight').toNumber(),
            commonKeywords: record.get('commonKeywords')
        }));
        return records;
    } catch (error) {
        return Promise.reject(error);
    }
}
              
module.exports = {getNodeRecords2, getEdgeRecords2, getEdgeRecords3};