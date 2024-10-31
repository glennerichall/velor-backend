export async function getDatabaseVersion(client, schema) {
    let res = await client.query(`select * from ${schema}.migrations 
            order by datetime desc, version desc
            limit 1`);

    if (res.rows.length !== 1) {
        return null;
    }

    return res.rows[0];
}


export async function getCurrentMigration(client, schema) {
    let res = await client.query(`
        select m.version, m.datetime, p.version as previous
        from ${schema}.migrations m
        left outer join ${schema}.migrations p on p.id = m.rollback
        order by m.datetime desc, m.version desc
        limit 1`);

    let current;
    let previous;

    let rows = res.rows;

    if (rows.length === 1) {
        current = rows[0].version;
        previous = rows[0].previous;
    }

    return {
        current,
        previous
    };
}

export async function getDatabaseTables(client, schema) {
    let res = await client.query(`SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = '${schema}'`);

    return res.rows;
}

export async function getDatabaseTableColumns(client, schema, tablename) {
    let res = await client.query(`SELECT *
            FROM information_schema.columns
            WHERE table_schema = '${schema}'
              AND table_name   = $1`, [tablename]);

    return res.rows;
}

export async function getDatabaseTablePKeys(client, schema, tablename) {
    let res = await client.query(`SELECT
            kcu.table_schema,
            kcu.table_name,
            tco.constraint_name,
            kcu.ordinal_position as position,
            kcu.column_name as key_column
        FROM information_schema.table_constraints tco
        JOIN information_schema.key_column_usage kcu
             ON kcu.constraint_name = tco.constraint_name
             AND kcu.constraint_schema = tco.constraint_schema
             AND kcu.constraint_name = tco.constraint_name
        WHERE tco.constraint_type = 'PRIMARY KEY'
          AND kcu.table_name = $1
          and kcu.table_schema = '${schema}'`, [tablename]);

    return res.rows;
}

export async function getDatabaseFKeys(client, schema) {
    let res = await client.query(`SELECT
                tc.constraint_name as constraint_name,
                tc.table_name      as table_name,
                kcu.column_name    as column_name,
                ccu.table_name     AS foreign_table_name,
                ccu.column_name    AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
            JOIN
                information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
                AND tc.table_name = kcu.table_name
            JOIN
                information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE
                tc.constraint_type = 'FOREIGN KEY'
                AND ccu.table_schema = '${schema}'
            GROUP BY
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name,
                ccu.column_name;
            `);

    return res.rows;
}

export async function getDatabaseIndexes(client, schema) {
    let res = await client.query(`SELECT
            t.relname AS table_name,
            i.relname AS index_name,
            array_to_string(array_agg('"' || a.attname || '"'), ', ') AS column_names,
            ix.indisunique AS is_unique
        FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a,
            pg_namespace n
        WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND n.oid = t.relnamespace
            AND n.nspname = '${schema}'
            AND NOT ix.indisprimary
        GROUP BY
            t.relname,
            i.relname,
            ix.indisunique
        ORDER BY
            t.relname,
            i.relname;
        `);

    return res.rows;
}

export async function getDatabaseEnums(client, schema) {
    let res = await client.query(`SELECT *, t.oid as toid
            FROM pg_type t
            JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = '${schema}' and
            t.typcategory = 'E'`);

    return res.rows;
}
