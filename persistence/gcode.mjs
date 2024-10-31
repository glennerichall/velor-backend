export async function queryFilesByHash(client, schema, hash) {
    const res = await client.query(`
        select * from ${schema}.files
        inner join ${schema}.gcode on gcode.file_id = files.id
        where files.hash = $1 and
        gcode.removed = false
    `, [hash]);

    return res.rows;
}

export async function queryFilesForAll(client, schema) {
    const res = await client
        .query(`select * from ${schema}.gcode
                    inner join ${schema}.files on gcode.file_id = files.id`);
    return res.rows;
}

// Aws callback
export async function deleteGcodeByBucketname(client, schema, bucketname, transact) {
    const res = await client
        .query(`delete
                    from ${schema}.${bucket}
                    where bucketname = $1`,
            [bucketname]);
    return res.rowCount;
}


// Initial instance creation
export async function createGcode(client, schema, bucketname, filename, fingerprint, userId) {
    const res = await client
        .query(`insert into ${schema}.gcode 
                        (file_id, filename, fingerprint, user_id)
                        values (
                        (select id from ${schema}.files
                        where bucketname = $1), 
                        $2, $3, $4)
                        returning *`,
            [bucketname, filename, fingerprint, userId]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function queryGcodeByBucketnames(client, schema, bucketnames) {
    const res = await client
        .query(`select *
                    from ${schema}.gcode g
                    inner join ${schema}.files f on f.id = g.file_id 
                    where f.bucketname = any ($1::text[])
                      and g.removed = false`,
            [bucketnames]);
    return res.rows;
}

export async function queryGcodeByBucketname(client, schema, bucketname) {
    const res = await queryGcodeByBucketnames(client, schema, [bucketname]);
    if (res.length === 1) {
        return res[0];
    }
    return null;
}


export async function queryRankForBucketname(client, schema, bucketname, {
    minSize = null,
    maxSize = null,
    status = null,
    minDate = null,
    maxDate = null,
    userId = null,
    sort = null,
    removed = false,
    filename = null,
    fingerprint = null
} = {}) {

    if (status !== null) {
        if (!Array.isArray(status)) {
            status = [status];
        }
    } else {
        status = [];
    }

    if (filename) {
        filename = "%" + filename + "%";
    }

    if (fingerprint) {
        fingerprint = "%" + fingerprint + "%";
    }

    let args = [
        minSize,    // 1
        maxSize,    // 2
        status,     // 3
        minDate,    // 4
        maxDate,    // 5
        userId,     // 6
        removed,    // 7
        bucketname, // 8
        filename,    // 9
        fingerprint, // 10
    ];

    let orderBy = '';
    if (sort !== undefined && sort !== null) {
        orderBy = `order by ${sort}`;
    }

    let sql = `WITH RankedResults AS (
                select *, ROW_NUMBER() OVER(${orderBy}) as idx
                from ${schema}.gcode g
                inner join ${schema}.files f on f.id = g.file_id 
                where (size <= $1 or (size is not null and $1 is null))
                and (size >= $2 or (size is not null and $2 is null))
                and (cardinality($3::${schema}.filestatus[]) = 0 or status = any($3::${schema}.filestatus[]))
                and (creation >= $4 or (creation is not null and $4 is null))
                and (creation <= $5 or (creation is not null and $5 is null))
                and (user_id = $6 or $6 is null)
                and (filename ilike $9 or $9 is null)
                and (fingerprint ilike $10 or $10 is null)
                and removed = $7
                ${orderBy}
            )
            SELECT idx 
            FROM RankedResults 
            WHERE bucketname = $8;`;

    const res = await client.query(sql, args);
    if (res.rowCount === 1) {
        return res.rows[0].idx;
    }
    return null;
}

export async function queryGcodeByPage(
    client, schema,
    {
        projection = '*',
        minSize = null,
        maxSize = null,
        status = null,
        minDate = null,
        maxDate = null,
        userId = null,
        sort = null,
        page = 1,
        count = 20,
        removed = false,
        filename = null,
        fingerprint = null,
        bucketname = null
    } = {}) {

    if (status !== null) {
        if (!Array.isArray(status)) {
            status = [status];
        }
    } else {
        status = [];
    }

    if (filename) {
        filename = "%" + filename + "%";
    }

    if (fingerprint) {
        fingerprint = "%" + fingerprint + "%";
    }

    if (bucketname) {
        bucketname = "%" + bucketname + "%";
    }

    const countArgs = [
        minSize,    // 1
        maxSize,    // 2
        status,     // 3
        minDate,    // 4
        maxDate,    // 5
        userId,     // 6,
        removed,    // 7
        filename,    // 8
        fingerprint, // 9
        bucketname,  // 10
    ];

    let args = [...countArgs];

    let countSql = `select count(*)
                        from ${schema}.gcode g
                        inner join ${schema}.files f on f.id = g.file_id 
                        where (size >= $1 or (size is not null and $1 is null))
                          and (size <= $2 or (size is not null and $2 is null))
                          and (cardinality($3::${schema}.filestatus[]) = 0 or status = any($3::${schema}.filestatus[]))
                          and (creation >= $4 or (creation is not null and $4 is null))
                          and (creation <= $5 or (creation is not null and $5 is null))
                          and (user_id = $6 or $6 is null)
                          and (filename ilike $8 or $8 is null)
                          and (fingerprint ilike $9 or $9 is null)
                          and (bucketname ilike $10 or $10 is null)
                          and removed = $7`;
    const resCount = await client.query(countSql, countArgs);
    let total = Number.parseInt(resCount.rows[0].count);
    let page_count = Math.ceil(total / count);

    if (total === 0) {
        return {
            files: [],
            total,
            page: 1,
            count,
            page_count,
        }
    }

    if (page > page_count) page = page_count;

    let first = undefined;
    let offset = '';
    let limit = '';
    if (page !== null && count !== null) {
        first = (page - 1) * count;
        args.push(first);          // 11
        args.push(count);          // 12
        offset = `offset $11`;
        limit = `limit $12`;
    }

    let orderBy = '';
    if (sort !== undefined && sort !== null) {
        orderBy = `order by ${sort}`;
    }

    let sql = `select ${projection}
                   from ${schema}.gcode g
                   inner join ${schema}.files f on f.id = g.file_id 
                   where (size >= $1 or (size is not null and $1 is null))
                     and (size <= $2 or (size is not null and $2 is null))
                     and (cardinality($3::${schema}.filestatus[]) = 0 or status = any($3::${schema}.filestatus[]))
                     and (creation >= $4 or (creation is not null and $4 is null))
                     and (creation <= $5 or (creation is not null and $5 is null))
                     and (user_id = $6 or $6 is null)
                     and (filename ilike $8 or $8 is null)
                     and (fingerprint ilike $9 or $9 is null)
                     and (bucketname ilike $10 or $10 is null)
                     and removed = $7
                       ${orderBy}
                       ${offset}
                       ${limit}`;

    const res = await client.query(sql, args);

    return {
        files: res.rows,
        total,
        page,
        count,
        page_count
    };
}

export async function updateGcodeSetRemovedOrDelete(client, schema, bucketnames) {
    const rows = [];
    // keep record when it is already uploaded
    let res = await client
        .query(`update ${schema}.gcode g
                    set removed = true
                    from ${schema}.files f
                    where 
                      f.id = g.file_id 
                      and f.bucketname = any ($1::text[])
                      and f.status in ('uploaded', 'ready', 'rejected', 'processing')
                      and g.removed = false
                    returning *`,
            [bucketnames]);

    rows.push(...res.rows);

    // remove record if it is not on S3
    res = await client
        .query(`delete
                    from ${schema}.files
                    where bucketname = any ($1::text[])
                      and status in ('created', 'uploading')
                    returning *`,
            [bucketnames]);
    rows.push(...res.rows);
    return rows;
}

export async function countAllGcode(client, schema, options = {}) {
    const {
        status = null,
        removed = null
    } = options;

    const result = await client.query(`
            select count(*) 
            from ${schema}.gcode g
            inner join ${schema}.files f on f.id = g.file_id
            where (g.removed = $1 or $1 is null) and 
                (f.status = $2 or $2 is null) and
                f.bucket='gcode'`, [removed, status]);
    return Number.parseInt(result.rows[0].count);
}

export async function countReadyGcode(client, schema, removed) {
    return countAllGcode(client, schema, {status: 'ready', removed});
}

export async function countRejectedGcode(client, schema, removed) {
    return countAllGcode(client, schema, {status: 'rejected', removed});
}

export async function countCreatedGcode(client, schema, removed) {
    return countAllGcode(client, schema, {status: 'created', removed});
}

export async function purgeUserFiles(client, schema) {
    let sql = `
            UPDATE ${schema}.gcode AS g
            SET removed = true
            WHERE g.id IN (
                SELECT g.id
                FROM ${schema}.gcode g
                JOIN ${schema}.files f ON f.id = g.file_id
                JOIN ${schema}.preferences p ON g.user_id = p.user_id
                WHERE p.name = 'files'
                AND CAST(p.value ->> 'purge' AS BOOLEAN) = true
                AND DATE_PART('day', current_timestamp - f.creation) >= CAST(p.value ->> 'purgeAfter' AS INTEGER)
            )
            RETURNING g.user_id::integer, g.filename, (
                SELECT f.bucketname
                FROM ${schema}.files f
                WHERE f.id = g.file_id
            ) AS bucketname;`

    const res = await client.query(sql);
    return res.rows;
}