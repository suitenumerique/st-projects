#!/usr/bin/env node

const http = require('http');
const https = require('https');

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const REALM_NAME = process.env.REALM_NAME || 'st-projects';
const ADMIN_USER = process.env.KEYCLOAK_ADMIN || 'admin';
const ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Wait for Keycloak to be ready
async function waitForKeycloak() {
  console.log('Waiting for Keycloak to be ready...');
  while (true) {
    try {
      const response = await makeRequest(
        `${KEYCLOAK_URL}/realms/master/.well-known/openid-configuration`
      );
      if (response.statusCode === 200) {
        console.log('Keycloak ready. Getting admin token...');
        return;
      }
    } catch (error) {
      // Continue waiting
    }
    console.log('Keycloak not ready yet...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Get admin access token
async function getAdminToken() {
  const url = `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    username: ADMIN_USER,
    password: ADMIN_PASSWORD,
    grant_type: 'password',
    client_id: 'admin-cli',
  });

  const response = await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (response.statusCode !== 200 || !response.data?.access_token) {
    console.error('❌ Failed to get admin token:');
    console.error(response.rawData);
    process.exit(1);
  }

  return response.data.access_token;
}

// Step 1: Add siret to user profile attributes
async function addSiretToUserProfile(accessToken) {
  console.log("Checking user profile for 'siret' attribute...");

  const response = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.statusCode !== 200) {
    console.error('⚠ Warning: Could not fetch user profile');
    return;
  }

  const profile = response.data;
  if (!profile) {
    console.error('⚠ Warning: Invalid user profile response');
    return;
  }

  // Check if siret attribute already exists
  const hasSiret = profile.attributes?.some((attr) => attr.name === 'siret');

  if (hasSiret) {
    console.log("✓ 'siret' attribute already exists in user profile — skipping.");
    return;
  }

  console.log("Adding 'siret' attribute to user profile...");

  // Add siret attribute
  if (!profile.attributes) {
    profile.attributes = [];
  }

  profile.attributes.push({
    name: 'siret',
    displayName: 'SIRET',
    validations: {},
    permissions: {},
    required: false,
    readOnly: false,
  });

  const updateResponse = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: profile,
    }
  );

  if (updateResponse.statusCode === 204 || updateResponse.statusCode === 200) {
    console.log("✓ 'siret' attribute added to user profile.");
  } else {
    console.error(`⚠ Warning: Could not add 'siret' attribute via API (HTTP ${updateResponse.statusCode})`);
    console.error(`  Response: ${updateResponse.rawData.substring(0, 200)}`);
    console.log('');
    console.log('  Note: You may need to add it manually in the Keycloak admin console:');
    console.log('  Realm Settings > User profile > Attributes > Create attribute');
    console.log('  Name: siret, Display name: SIRET');
  }
}

// Step 2: Add IDP mapper for SIRET claim -> siret user attribute
async function addIdpMappers(accessToken) {
  console.log('Checking for identity providers to map SIRET claim...');

  const response = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.statusCode !== 200 || !Array.isArray(response.data)) {
    console.log('No identity providers found — skipping IDP claim mapping.');
    console.log("  Note: When an IDP is added, configure it to map claim 'SIRET' to user attribute 'siret'");
    return;
  }

  const idps = response.data;
  if (idps.length === 0) {
    console.log('No identity providers found — skipping IDP claim mapping.');
    console.log("  Note: When an IDP is added, configure it to map claim 'SIRET' to user attribute 'siret'");
    return;
  }

  console.log(`Found ${idps.length} identity provider(s). Configuring SIRET claim mapping...`);

  for (const idp of idps) {
    const alias = idp.alias;
    console.log(`Processing IDP: ${alias}`);

    // Check if siret mapper already exists
    const mappersResponse = await makeRequest(
      `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances/${alias}/mappers`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (mappersResponse.statusCode === 200 && Array.isArray(mappersResponse.data)) {
      const hasSiretMapper = mappersResponse.data.some((mapper) => mapper.name === 'siret');
      if (hasSiretMapper) {
        console.log(`  ✓ Siret mapper already exists for IDP ${alias} — skipping.`);
        continue;
      }
    }

    console.log(`  Adding siret mapper to IDP ${alias} (SIRET -> siret)...`);

    const createMapperResponse = await makeRequest(
      `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances/${alias}/mappers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          name: 'siret',
          identityProviderAlias: alias,
          identityProviderMapper: 'oidc-user-attribute-idp-mapper',
          config: {
            claim: 'SIRET',
            'user.attribute': 'siret',
          },
        },
      }
    );

    if (createMapperResponse.statusCode === 201 || createMapperResponse.statusCode === 200) {
      console.log(`  ✓ Siret mapper successfully added to IDP ${alias}.`);
    } else {
      console.error(
        `  ⚠ Warning: Failed to create siret mapper for IDP ${alias} (HTTP ${createMapperResponse.statusCode})`
      );
      console.error(`    Response: ${createMapperResponse.rawData.substring(0, 200)}`);
    }
  }
}

// Step 3: Add siret mapper to organization scope
async function addSiretToOrganizationScope(accessToken) {
  console.log('Finding organization client scope...');

  // Get all client scopes
  const scopesResponse = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (scopesResponse.statusCode !== 200 || !Array.isArray(scopesResponse.data)) {
    console.error('❌ Failed to fetch client scopes');
    process.exit(1);
  }

  // Find organization scope
  const orgScope = scopesResponse.data.find((scope) => scope.name === 'organization');
  const orgScopeId = orgScope?.id;

  if (!orgScopeId) {
    console.error('❌ Organization scope not found');
    process.exit(1);
  }

  console.log(`Found organization scope (ID: ${orgScopeId})`);
  console.log('');
  console.log("Checking organization scope for 'siret' mapper...");

  // Check if mapper already exists
  const mappersResponse = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${orgScopeId}/protocol-mappers/models`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (mappersResponse.statusCode === 200 && Array.isArray(mappersResponse.data)) {
    const hasSiretMapper = mappersResponse.data.some((mapper) => mapper.name === 'siret');
    if (hasSiretMapper) {
      console.log("✓ 'siret' mapper already exists in organization scope — skipping.");
      return;
    }
  }

  console.log("Adding 'siret' protocol mapper to organization scope...");

  const createMapperResponse = await makeRequest(
    `${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${orgScopeId}/protocol-mappers/models`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        name: 'siret',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        config: {
          'userinfo.token.claim': 'true',
          'user.attribute': 'siret',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'siret',
          'jsonType.label': 'String',
        },
      },
    }
  );

  if (createMapperResponse.statusCode === 201 || createMapperResponse.statusCode === 200) {
    console.log("✓ 'siret' mapper successfully added to organization scope.");
  } else {
    console.error(`❌ Failed to create 'siret' mapper (HTTP ${createMapperResponse.statusCode})`);
    console.error(`  Response: ${createMapperResponse.rawData.substring(0, 200)}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    await waitForKeycloak();
    const accessToken = await getAdminToken();

    console.log('');
    await addSiretToUserProfile(accessToken);

    console.log('');
    await addIdpMappers(accessToken);

    console.log('');
    await addSiretToOrganizationScope(accessToken);

    console.log('');
    console.log('Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
