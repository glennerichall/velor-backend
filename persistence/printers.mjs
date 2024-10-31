import {tryInsertUnique} from "velor/database/database.mjs";

export async function createPrinterInstance(client, schema, version) {
    return tryInsertUnique(client, `insert into ${schema}.printers 
                            (uuid, version) values(gen_random_uuid(), $1)
                            returning *`, [version]);
}

export async function updatePrinterConnectionStatus(client, schema, uuid) {
    let res = await client
        .query(`update ${schema}.printers 
            set last_seen=CURRENT_TIMESTAMP
            where uuid=$1
            returning *`, [uuid]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function updatePrinterVersion(client, schema, uuid, version) {
    let res = await client
        .query(`update ${schema}.printers 
            set version=$2
            where uuid=$1
            returning *`, [uuid, version]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function updatePrinterTitle(client, schema, uuid, title) {
    let res = await client
        .query(`update ${schema}.printers 
            set name=$1
            where uuid=$2
            returning *`, [title, uuid]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function removePrinterLink(client, schema, uuid) {
    const res = await client.query(
        `update ${schema}.printers
             set user_id=null
             where uuid=$1 and user_id is not null
             returning *`, [uuid]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function queryPrinterInstance(client, schema, uuid) {
    const res = await client.query(
        `select * from ${schema}.printers
             where uuid=$1`, [uuid]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function queryPrinterInstancesForUser(client, schema, userId) {
    const res = await client.query(
        `SELECT
                o.uuid,
                o.name,
                o.creation,
                o.last_seen,
                o.version,
                si.snapshot
            FROM ${schema}.printers o
            LEFT JOIN (
                SELECT
                    o.id AS uuid,
                    md5(bucketname) AS snapshot
                    FROM ${schema}.printers_snapshots s
                    INNER JOIN ${schema}.files f ON f.id = s.file_id
                    INNER JOIN ${schema}.printers o ON s.printer_id = o.id
                    WHERE f.status = 'ready'::${schema}.filestatus
                    ORDER BY f.creation DESC
                LIMIT 1
            ) si ON o.id = si.uuid
            WHERE o.user_id=$1`, [userId]);
    return res.rows;
}

export async function createPrinterLink(client, schema, uuid, userId) {
    const res = await client.query(
        `update ${schema}.printers
             set user_id=$2
             where uuid=$1
             returning *`, [uuid, userId]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function addApiKeyToPrinter(client, schema, printerId, apiKeyId) {
    const res = await client.query(
        `insert into ${schema}.printers_api_keys(api_key_id,printer_id)
             values($1, $2)`, [apiKeyId, printerId]);
    return res.rowCount === 1;
}

export async function queryForPrinterApiKey(client, schema, uuid, apiKey) {
    const res = await client.query(
        `select * from ${schema}.api_keys
        inner join ${schema}.printers_api_keys on api_keys.id=printers_api_keys.api_key_id
        inner join ${schema}.printers on printers.id=printers_api_keys.printer_id
        where printers.uuid = $1
            and api_keys.value=crypt(left($2,36), api_keys.value)
            and api_keys.public_id=right($2,36)
        `, [uuid, apiKey]);
    return res.rowCount === 1 ? res.rows[0] : null;
}