module.exports = {
  inputs: {
    offset: {
      type: 'number',
      defaultsTo: 0,
      min: 0,
    },
    limit: {
      type: 'number',
      defaultsTo: 1000,
      min: 1,
      max: 1000,
    },
  },

  async fn(inputs) {
    const db = sails.getDatastore();

    const countResult = await db.sendNativeQuery(
      `SELECT COUNT(DISTINCT organization_id) AS total
       FROM user_account
       WHERE organization_id IS NOT NULL AND deleted_at IS NULL`,
    );
    const count = parseInt(countResult.rows[0].total, 10);

    const rows = await db.sendNativeQuery(
      `SELECT
         u.organization_id,
         COUNT(DISTINCT u.id) AS tu,
         COUNT(DISTINCT CASE WHEN s.created_at > NOW() - INTERVAL '365 days' THEN u.id END) AS yau,
         COUNT(DISTINCT CASE WHEN s.created_at > NOW() - INTERVAL '30 days' THEN u.id END) AS mau,
         COUNT(DISTINCT CASE WHEN s.created_at > NOW() - INTERVAL '7 days' THEN u.id END) AS wau
       FROM user_account u
       LEFT JOIN session s ON s.user_id = u.id AND s.deleted_at IS NULL
       WHERE u.organization_id IS NOT NULL AND u.deleted_at IS NULL
       GROUP BY u.organization_id
       ORDER BY u.organization_id ASC
       LIMIT $1 OFFSET $2`,
      [inputs.limit, inputs.offset],
    );

    const results = rows.rows.map((row) => {
      const id = row.organization_id;
      let identifierKey;
      if (id.length === 14 && /^\d{14}$/.test(id)) {
        identifierKey = 'siret';
      } else if (id.length === 9 && /^\d{9}$/.test(id)) {
        identifierKey = 'siren';
      } else if (id.length === 5 && /^\d{5}$/.test(id)) {
        identifierKey = 'insee';
      } else {
        identifierKey = 'siret';
      }

      return {
        [identifierKey]: id,
        metrics: {
          tu: parseInt(row.tu, 10),
          yau: parseInt(row.yau, 10),
          mau: parseInt(row.mau, 10),
          wau: parseInt(row.wau, 10),
        },
      };
    });

    return this.res.json({ count, results });
  },
};
