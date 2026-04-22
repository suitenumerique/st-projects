module.exports = async function isStatsAuthorized(req, res, proceed) {
  const statsToken = sails.config.custom.statsApiToken;

  if (!statsToken) {
    return res.serverError({ error: 'Erreur interne du serveur' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token || token !== statsToken) {
    return res.forbidden({ error: 'Unauthorized' });
  }

  return proceed();
};
