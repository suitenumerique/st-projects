#!/bin/bash
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
REALM_NAME="${REALM_NAME:-st-projects}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

echo "Waiting for Keycloak to be ready..."
until curl -fs "${KEYCLOAK_URL}/realms/master/.well-known/openid-configuration" >/dev/null; do
  echo "Keycloak not ready yet..."
  sleep 2
done

echo "Keycloak ready. Getting admin token..."

# Get admin access token (without jq)
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | sed -n 's/.*"access_token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get admin token:"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

# Step 1: Add siret to user profile attributes
echo "Checking user profile for 'siret' attribute..."

USER_PROFILE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile")

# Check if siret attribute already exists
if echo "$USER_PROFILE" | grep -q '"name"[[:space:]]*:[[:space:]]*"siret"'; then
  echo "✓ 'siret' attribute already exists in user profile — skipping."
else
  echo "Adding 'siret' attribute to user profile..."

  # Keycloak User Profile API requires the full profile structure
  # We'll get the current profile, add siret to the attributes array, and PUT it back

  # Try using jq if available (most reliable)
  if command -v jq >/dev/null 2>&1; then
    UPDATED_PROFILE=$(echo "$USER_PROFILE" | jq '.attributes += [{
      "name": "siret",
      "displayName": "SIRET",
      "validations": {},
      "permissions": {},
      "required": false,
      "readOnly": false
    }]' 2>/dev/null)
  # Fallback to Python if available
  elif command -v python3 >/dev/null 2>&1; then
    UPDATED_PROFILE=$(echo "$USER_PROFILE" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    if 'attributes' not in data:
        data['attributes'] = []
    if not any(attr.get('name') == 'siret' for attr in data.get('attributes', [])):
        data['attributes'].append({
            'name': 'siret',
            'displayName': 'SIRET',
            'validations': {},
            'permissions': {},
            'required': False,
            'readOnly': False
        })
    print(json.dumps(data))
except:
    sys.exit(1)
" 2>/dev/null)
  else
    # Pure bash/sed approach - find the attributes array and insert siret
    # This is fragile but works for simple cases
    if echo "$USER_PROFILE" | grep -q '"attributes"'; then
      # Find where to insert - look for the closing bracket of attributes array or add after opening
      # We'll insert before the closing bracket of the attributes array
      SIRET_ATTR='{"name":"siret","displayName":"SIRET","validations":{},"permissions":{},"required":false,"readOnly":false}'

      # Try to insert after the opening of attributes array or before closing bracket
      # This is a simplified approach - may need adjustment based on actual JSON structure
      if echo "$USER_PROFILE" | grep -q '"attributes":\[\]'; then
        # Empty attributes array
        UPDATED_PROFILE=$(echo "$USER_PROFILE" | sed "s/\"attributes\":\[\]/\"attributes\":[$SIRET_ATTR]/")
      elif echo "$USER_PROFILE" | grep -q '"attributes":\[{'; then
        # Non-empty array - insert before closing bracket
        UPDATED_PROFILE=$(echo "$USER_PROFILE" | sed "s/\(.*\"attributes\":\[.*\)\]\(.*\)/\1,$SIRET_ATTR]\2/")
      else
        UPDATED_PROFILE=""
      fi
    else
      # No attributes key - add it
      UPDATED_PROFILE=$(echo "$USER_PROFILE" | sed "s/\({.*\)/\1\"attributes\":[{\"name\":\"siret\",\"displayName\":\"SIRET\",\"validations\":{},\"permissions\":{},\"required\":false,\"readOnly\":false}]/")
    fi
  fi

  if [ -n "$UPDATED_PROFILE" ] && [ "$UPDATED_PROFILE" != "$USER_PROFILE" ]; then
    UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
      "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$UPDATED_PROFILE")

    UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)

    if [ "$UPDATE_HTTP_CODE" = "204" ] || [ "$UPDATE_HTTP_CODE" = "200" ]; then
      echo "✓ 'siret' attribute added to user profile."
    else
      echo "⚠ Warning: Could not add 'siret' attribute via API (HTTP $UPDATE_HTTP_CODE)"
      echo "  Response: $(echo "$UPDATE_RESPONSE" | head -n -1 | head -c 200)"
      echo ""
      echo "  Note: You may need to add it manually in the Keycloak admin console:"
      echo "  Realm Settings > User profile > Attributes > Create attribute"
      echo "  Name: siret, Display name: SIRET"
    fi
  else
    echo "⚠ Warning: Could not modify user profile JSON (jq/python3 recommended)"
    echo "  You may need to add 'siret' manually in the Keycloak admin console:"
    echo "  Realm Settings > User profile > Attributes > Create attribute"
    echo "  Name: siret, Display name: SIRET"
  fi
fi

echo ""

# Step 2: Add IDP mapper for SIRET claim -> siret user attribute
echo "Checking for identity providers to map SIRET claim..."

IDP_LIST=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances")

# Check if any IDPs exist
IDP_COUNT=$(echo "$IDP_LIST" | grep -o '"alias"' | wc -l | tr -d ' ')

if [ "$IDP_COUNT" -gt 0 ]; then
  echo "Found $IDP_COUNT identity provider(s). Configuring SIRET claim mapping..."

  # Get all IDP aliases
  IDP_ALIASES=$(echo "$IDP_LIST" | grep -o '"alias":"[^"]*' | cut -d'"' -f4)

  for IDP_ALIAS in $IDP_ALIASES; do
    echo "Processing IDP: $IDP_ALIAS"

    # Check if siret mapper already exists for this IDP
    IDP_MAPPERS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
      "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances/${IDP_ALIAS}/mappers")

    if echo "$IDP_MAPPERS" | grep -q '"name":"siret"'; then
      echo "  ✓ Siret mapper already exists for IDP $IDP_ALIAS — skipping."
    else
      echo "  Adding siret mapper to IDP $IDP_ALIAS (SIRET -> siret)..."

      IDP_MAPPER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/identity-provider/instances/${IDP_ALIAS}/mappers" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "siret",
          "identityProviderAlias": "'"${IDP_ALIAS}"'",
          "identityProviderMapper": "oidc-user-attribute-idp-mapper",
          "config": {
            "claim": "SIRET",
            "user.attribute": "siret"
          }
        }')

      IDP_MAPPER_HTTP_CODE=$(echo "$IDP_MAPPER_RESPONSE" | tail -n1)

      if [ "$IDP_MAPPER_HTTP_CODE" = "201" ] || [ "$IDP_MAPPER_HTTP_CODE" = "200" ]; then
        echo "  ✓ Siret mapper successfully added to IDP $IDP_ALIAS."
      else
        echo "  ⚠ Warning: Failed to create siret mapper for IDP $IDP_ALIAS (HTTP $IDP_MAPPER_HTTP_CODE)"
        echo "    Response: $(echo "$IDP_MAPPER_RESPONSE" | head -n -1 | head -c 200)"
      fi
    fi
  done
else
  echo "No identity providers found — skipping IDP claim mapping."
  echo "  Note: When an IDP is added, configure it to map claim 'SIRET' to user attribute 'siret'"
fi

echo ""

# Step 3: Create siret client scope and add mapper
echo "Checking for 'siret' client scope..."

SCOPE_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes")

# Check if siret scope already exists
SIRET_SCOPE_ID=$(echo "$SCOPE_RESPONSE" | tr -d '\n' \
  | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([a-f0-9-]*\)".*"name"[[:space:]]*:[[:space:]]*"siret".*/\1/p')

if [ -n "$SIRET_SCOPE_ID" ]; then
  echo "✓ 'siret' client scope already exists (ID: $SIRET_SCOPE_ID)"
else
  echo "Creating 'siret' client scope..."

  CREATE_SCOPE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "siret",
      "description": "SIRET number scope",
      "protocol": "openid-connect",
      "attributes": {
        "include.in.token.scope": "true",
        "display.on.consent.screen": "true",
        "consent.screen.text": "SIRET number"
      }
    }')

  CREATE_SCOPE_HTTP_CODE=$(echo "$CREATE_SCOPE_RESPONSE" | tail -n1)
  CREATE_SCOPE_BODY=$(echo "$CREATE_SCOPE_RESPONSE" | head -n -1)

  if [ "$CREATE_SCOPE_HTTP_CODE" = "201" ]; then
    echo "✓ 'siret' client scope created"
    # Try to extract ID from creation response first
    SIRET_SCOPE_ID=$(echo "$CREATE_SCOPE_BODY" | tr -d '\n' | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([a-f0-9-]*\)".*/\1/p')

    # If extraction failed, re-fetch the scope list
    if [ -z "$SIRET_SCOPE_ID" ]; then
      echo "  Re-fetching scope list to get ID..."
      sleep 1
      SCOPE_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes")
      SIRET_SCOPE_ID=$(echo "$SCOPE_RESPONSE" | tr -d '\n' \
        | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([a-f0-9-]*\)".*"name"[[:space:]]*:[[:space:]]*"siret".*/\1/p')
    fi

    if [ -z "$SIRET_SCOPE_ID" ]; then
      echo "❌ Failed to retrieve 'siret' scope ID after creation"
      echo "  Creation response: $(echo "$CREATE_SCOPE_BODY" | head -c 200)"
      exit 1
    fi
    echo "  Scope ID: $SIRET_SCOPE_ID"
  else
    echo "❌ Failed to create 'siret' client scope (HTTP $CREATE_SCOPE_HTTP_CODE)"
    echo "  Response: $(echo "$CREATE_SCOPE_RESPONSE" | head -n -1 | head -c 200)"
    exit 1
  fi
fi

# Validate that we have a scope ID before proceeding
if [ -z "$SIRET_SCOPE_ID" ]; then
  echo "❌ 'siret' scope ID is empty - cannot proceed"
  exit 1
fi

echo ""
echo "Adding 'siret' mapper to 'siret' client scope..."

# Check if siret mapper already exists in the scope
EXISTING_MAPPERS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${SIRET_SCOPE_ID}/protocol-mappers/models")

if echo "$EXISTING_MAPPERS" | grep -q '"name":"siret"'; then
  echo "✓ 'siret' mapper already exists in 'siret' scope — skipping."
else
  echo "Adding 'siret' protocol mapper..."

  MAPPER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${SIRET_SCOPE_ID}/protocol-mappers/models" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "siret",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-usermodel-attribute-mapper",
      "config": {
        "userinfo.token.claim": "true",
        "user.attribute": "siret",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "claim.name": "siret",
        "jsonType.label": "String"
      }
    }')

  MAPPER_HTTP_CODE=$(echo "$MAPPER_RESPONSE" | tail -n1)

  if [ "$MAPPER_HTTP_CODE" = "201" ] || [ "$MAPPER_HTTP_CODE" = "200" ]; then
    echo "✓ 'siret' mapper successfully added to 'siret' scope."
  else
    echo "❌ Failed to create 'siret' mapper (HTTP $MAPPER_HTTP_CODE)"
    echo "  Response: $(echo "$MAPPER_RESPONSE" | head -n -1 | head -c 200)"
    exit 1
  fi
fi

echo ""
echo "Done!"
