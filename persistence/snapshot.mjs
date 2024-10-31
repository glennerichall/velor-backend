
export async function queryFilesByHash(client, schema, hash) {
    const res = await client.query(`
        select * from ${schema}.files
        inner join ${schema}.octoprint_snapshots on octoprint_snapshots.file_id = files.id
        where files.hash = $1
    `, [hash]);

    return res.rows;
}

export async function createSnapshot(client, schema, bucketname, uuid, options) {
    const {
        flip_h = false,
        flip_v = false,
        rotate_90 = false
    } = options;
    const res = await client
        .query(`insert into ${schema}.printers_snapshots
                        (file_id, printer_id, flip_h, flip_v, rotate_90)
                        values (
                        (select id from ${schema}.files
                        where bucketname = $1), 
                        (select id from ${schema}.printers
                         where uuid=$2),
                         $3, $4, $5)
                        returning *, (select user_id from ${schema}.printers
                         where uuid=$2) as user_id`,
            [bucketname, uuid, flip_h, flip_v, rotate_90]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function querySnapshotByBucketnames(client, schema, bucketnames) {
    const res = await client
        .query(`select *
                    from ${schema}.printers_snapshots s
                    inner join ${schema}.files f on f.id = s.file_id 
                    inner join ${schema}.printers o on s.printer_id = o.id
                    where f.bucketname = any ($1::text[])`,
            [bucketnames]);
    return res.rows;
}

export async function querySnapshotByBucketname(client, schema, bucketname) {
    const res = await querySnapshotByBucketnames(client, schema, [bucketname]);
    if (res.length === 1) {
        return res[0];
    }
    return null;
}

export async function queryForAll(client, schema, uuid) {
    let res = await client.query(`
        select * from ${schema}.printers_snapshots s
         inner join ${schema}.printers o on o.id = s.printer_id 
         where o.uuid = $1
    `, [uuid]);

    return res.rows;
}

export async function queryLastSnapshot(client, schema, uuid) {
    let res = await client
        .query(`select f.*, s.*
                    from ${schema}.printers_snapshots s
                    inner join ${schema}.files f on f.id = s.file_id
                    inner join ${schema}.printers o on o.id = s.printer_id 
                    where o.uuid = $1
                    and f.status = 'ready'::${schema}.filestatus
                    order by f.creation desc
                    limit 1;`, [uuid]);
    return res.rowCount === 1 ? res.rows[0] : null;
}