import PG from 'pg';

const {Pool} = PG;

export const createConnectionPool = (connectionString) => {
    return new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        }
    });
};

export async function tryInsertUnique(client, query, args) {
    while (true) {
        try {
            const res = await client.query(query, args);
            return res.rows[0];
        } catch (e) {
            if (e.code !== '23505') {
                throw e;
            }
        }
    }
}