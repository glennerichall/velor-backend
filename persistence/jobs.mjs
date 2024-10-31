// import {createConnectionPool} from "../database/database.mjs";
//
// const schema = process.env.ZUPFE_DATABASE_SCHEMA;
//
// function parseJob(res) {
//     if (res.rows.length === 1) {
//         return res.rows[0];
//     }
//     return null;
// }
//
// export async function createJob(name, content) {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`insert into ${schema}.jobs (name, content)
//                     values ($1, $2)
//                     returning *`,
//                 [name, content]);
//         return parseJob(res);
//     } finally {
//         client.release()
//     }
// }
//
// export async function queryTakeFIFOJob(name) {
//     const client = await createConnectionPool().connect()
//     try {
//         await client.query('BEGIN');
//         // FIXME find best lock mode
//         // https://www.citusdata.com/blog/2018/02/15/when-postgresql-blocks/
//         await client.query(`LOCK TABLE ${schema}.jobs IN ACCESS EXCLUSIVE MODE`);
//         const res = await client
//             .query(`update ${schema}.jobs
//                     set status='processing'
//                     where id = (select id
//                                 from ${schema}.jobs
//                                 where status = 'pending'
//                                   and name = $1
//                                 order by creation asc
//                                 limit 1)
//                     returning *`, [name]);
//         await client.query('COMMIT');
//         return parseJob(res);
//     } finally {
//         await client.query('ROLLBACK');
//         client.release()
//     }
// }
//
// export async function updateJobStatus(id, status = 'pending') {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`update ${schema}.jobs
//                     set status=$1
//                     where id = $2`, [status, id]);
//         return res.rowCount;
//     } finally {
//         client.release()
//     }
// }
//
// export async function finishJob(id, result = 'success') {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`update ${schema}.jobs
//                     set status='finished',
//                         result=$1
//                     where id = $2`, [result, id]);
//         return res.rowCount;
//     } finally {
//         client.release()
//     }
// }
//
// export async function deleteJob(id) {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`delete
//                     from ${schema}.jobs
//                     where id = $1`, [id]);
//         return res.rowCount;
//     } finally {
//         client.release()
//     }
// }
//
// export async function queryForAllJobs() {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`select *
//                     from ${schema}.jobs`);
//         return res.rows.map(parseContent);
//     } finally {
//         client.release()
//     }
// }
//
// export async function flushAllJobs() {
//     const client = await createConnectionPool().connect()
//     try {
//         const res = await client
//             .query(`delete
//                     from ${schema}.jobs
//                     where true`);
//         return res.rowCount;
//     } finally {
//         client.release()
//     }
// }