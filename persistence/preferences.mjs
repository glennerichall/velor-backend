export async function deletePreferenceByName(client, schema, name, userId) {
    const res = await client
        .query(`delete
                    from ${schema}.preferences
                    where user_id = $1
                      and name = $2`, [userId, name]);
    return res.rowCount;
}

export async function queryPreferenceByName(client, schema, name, userId) {
    const res = await client
        .query(`select *
                    from ${schema}.preferences
                    where user_id = $1
                      and name = $2`, [userId, name]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}

export async function upsertPreference(client, schema, name, userId, value) {
    const res = await client
        .query(`insert
                    into ${schema}.preferences (name, user_id, value)
                    values ($1, $2, $3)
                    on conflict ("name", "user_id")
                        do update
                        set value=$3
                    returning *`, [name, userId, value]);
    return res.rows.length === 1 ? res.rows[0] : null;
}