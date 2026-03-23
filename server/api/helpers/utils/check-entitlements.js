module.exports = {
  inputs: {
    email: {
      type: 'string',
      required: true,
    },
    siret: {
      type: 'string',
    },
    sub: {
      type: 'string',
      required: true,
    },
    idpId: {
      type: 'string',
    },
  },

  exits: {
    notConfigured: {},
    accessDenied: {},
    oidcInvalidSiret: {},
  },

  async fn(inputs) {
    const { entitlementsApiKey, entitlementsServiceId } = sails.config.custom;

    if (!entitlementsApiKey || !entitlementsServiceId) {
      throw 'notConfigured';
    }

    const params = new URLSearchParams({
      service_id: entitlementsServiceId,
      account_type: 'user',
      account_id: inputs.sub,
      account_email: inputs.email,
    });

    if (inputs.siret) {
      params.set('siret', inputs.siret);
    }
    if (inputs.idpId) {
      params.set('idp_id', inputs.idpId);
    }

    const url = `https://operateurs.suite.anct.gouv.fr/api/v1.0/entitlements/?${params.toString()}`;

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'X-Service-Auth': `Bearer ${entitlementsApiKey}`,
        },
      });
    } catch (error) {
      sails.log.warn(`Entitlements API unreachable: ${error.message} — allowing access`);
      return null;
    }

    if (!response.ok) {
      sails.log.warn(
        `Entitlements API returned ${response.status} for ${inputs.email} — allowing access`,
      );
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      sails.log.warn(`Entitlements API returned invalid JSON — allowing access`);
      return null;
    }

    if (data.organization && data.organization.oidc_valid === false) {
      sails.log.warn(
        `Entitlements: oidc_valid=false for ${inputs.email} (siret=${inputs.siret}) — refusing access`,
      );
      throw 'oidcInvalidSiret';
    }

    if (data.entitlements && data.entitlements.can_access === false) {
      sails.log.warn(
        `Entitlements: can_access=false for ${inputs.email} (siret=${inputs.siret}) — refusing access`,
      );
      throw 'accessDenied';
    }

    return data;
  },
};
