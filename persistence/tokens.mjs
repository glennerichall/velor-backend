export async function createToken(client, schema, expiration, tag) {
    const res = await client
        .query(`insert into ${schema}.tokens (expiration, tag)
                values (current_timestamp + $1 * INTERVAL '1 minute', $2)
                returning *`,
            [expiration, tag]);
    return res.rows[0];
}

export async function queryForToken(client, schema, value) {
    const res = await client.query(`
            select * from ${schema}.tokens 
            where value = $1`, [value]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function useToken(client, schema, value) {
    const res = await client
        .query(`update ${schema}.tokens
                set usage = usage + 1
                where value = $1
                returning *,
                    (usage > max_usage) as limit_reached,
                    (expiration <= current_timestamp) as expired`,
            [value]);

    let token = null;
    if (res.rowCount === 1) {
        token = res.rows[0];
        if (token.limit_reached || token.expired) {
            await removeToken(client, schema, value);
        }
    }

    return token;
}

export async function removeToken(client, schema, value) {
    const res = await client
        .query(`delete from ${schema}.tokens
                    where value = $1`, [value]);
    return !!res.rowCount;
}

export async function removeTokens(client, schema) {
    const res = await client
        .query(`insert into ${schema}.tokens (expiration, value)
                    values ($1, $2)`);
    return res.rowCount;
}

export async function cleanTokens(client, schema) {
    const res = await client
        .query(`delete
            from ${schema}.tokens
            where expiration < CURRENT_TIMESTAMP or
                  usage >= max_usage`);
    return res.rowCount;
}