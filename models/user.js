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
    MATCH (n:Customer)
    WHERE n.lastname = $id and n.loginPw=$password
    RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
`;
const query2=`
    MATCH (n:Customer)
    WHERE n.identity=$identity
    RETURN n.identity as identity, n.lastname as id, n.loginPw as password,n.pagerank as pagerank,n.community as community
`;

const id="Kang";
const password=221115889719;
const identity=0;
//session.run(query, { id: id, password: neo4j.int(password) })

session.run(query, { id: id, password: neo4j.int(password) })
    .then(result => {
        result.records.forEach(record => {
            const identity = record.get('identity');
            const id = record.get('id');
            const password = record.get('password');
            const pagerank = record.get('pagerank');
            const community = record.get('community');
            console.log(`identity: ${identity}, id: ${id}, password: ${password}, pagerank: ${pagerank}, community: ${community}`);
        });
    })
    .catch(error => {
        console.error(error);
      })
    .finally(() => {
        session.close();
    });

    const session2 = driver.session(); 
    session2.run(query2, { identity: neo4j.int(identity) })
        .then(result => {
            result.records.forEach(record => {
                const identity = record.get('identity');
                const id = record.get('id');
                const password = record.get('password');
                const pagerank = record.get('pagerank');
                const community = record.get('community');
                console.log(`identity: ${identity}, id: ${id}, password: ${password}, pagerank: ${pagerank}, community: ${community}`);
            });
        })
        .catch(error => {
            console.error(error);
          })
        .finally(() => {
            session2.close();
            driver.close();
        });
    
async function getUserRecord(query, id, password) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { id: id, password: neo4j.int(password) });
        /* const records = result.records.map(record => ({
            identity: record.get('identity').toNumber(),
            id: record.get('id'),
            password: record.get('password').toNumber(),
            pagerank: record.get('pagerank'),
            community: record.get('community').toNumber()
        })); */
        const record = result.records[0]; // Get the first record
        const data = {
            identity: record.get('identity').toNumber(),
            id: record.get('id'),
            password: record.get('password').toNumber(),
            pagerank: record.get('pagerank'),
            community: record.get('community').toNumber()
        };
        return data;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function getUserRecord2(query, identity) {
    const driver= createDriver();
    const session = driver.session();
    try {
        const result = await session.run(query, { identity: neo4j.int(identity) });
        const record = result.records[0]; // Get the first record
        const data = {
            identity: record.get('identity').toNumber(),
            id: record.get('id'),
            password: record.get('password').toNumber(),
            pagerank: record.get('pagerank'),
            community: record.get('community').toNumber()
        };
        return data;
    } catch (error) {
        return Promise.reject(error);
    }
}


//module.exports = getUserRecord;
module.exports = {getUserRecord, getUserRecord2};
