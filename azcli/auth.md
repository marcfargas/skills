# Auth & Configuration

## Authentication Methods

| Method | Use Case |
|--------|----------|
| Interactive (`az login`) | Local development |
| Service principal | Scripts, CI/CD |
| Managed identity | Azure-hosted workloads (VMs, App Service, Functions) |
| Device code | Headless / remote terminals |

## Interactive Login

```bash
# Opens browser for sign-in
az login

# Device code flow (headless / SSH sessions)
az login --use-device-code

# Specific tenant
az login --tenant TENANT_ID

# Check who's logged in
az account show -o json

# List all accounts
az account list -o table

# Logout
az logout
```

## Service Principal (CI/CD, Automation)

**Prefer managed identities when running on Azure. Use service principals for external CI/CD.**

```bash
# Create service principal with Contributor role on a subscription
az ad sp create-for-rbac --name "my-ci-sp" \
  --role Contributor \
  --scopes /subscriptions/SUBSCRIPTION_ID

# Output (save securely — shown only once):
# {
#   "appId": "...",
#   "displayName": "my-ci-sp",
#   "password": "...",
#   "tenant": "..."
# }

# Login with service principal
az login --service-principal \
  --username APP_ID \
  --password CLIENT_SECRET \
  --tenant TENANT_ID

# Login with certificate (more secure — no shared secret)
az login --service-principal \
  --username APP_ID \
  --certificate /path/to/cert.pem \
  --tenant TENANT_ID

# Login with federated credential (GitHub Actions — no secrets at all)
az login --service-principal \
  --username APP_ID \
  --tenant TENANT_ID \
  --federated-token "$GITHUB_TOKEN"
```

> ⚠️ **Never commit service principal credentials.** Store in Key Vault,
> GitHub Secrets, or Azure DevOps variable groups. Rotate regularly.

## Managed Identity (Azure-hosted only)

```bash
# Login with system-assigned managed identity
az login --identity

# Login with user-assigned managed identity
az login --identity --username MANAGED_IDENTITY_CLIENT_ID
```

No credentials to manage — Azure handles token refresh automatically.

## Subscription Management

```bash
# List all subscriptions
az account list -o table

# Show current subscription
az account show -o json

# Switch subscription
az account set --subscription "My Subscription Name"
az account set --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Get subscription ID for scripting
SUB_ID=$(az account show --query id -o tsv)

# Per-command subscription override
az vm list --subscription "Other Sub" -o json
```

## Tenant Management

```bash
# List tenants
az account tenant list -o json

# Switch tenant (requires re-login)
az login --tenant TENANT_ID

# Show current tenant
az account show --query tenantId -o tsv
```

## Access Tokens

```bash
# Get access token for current subscription
az account get-access-token -o json

# Get token for specific resource
az account get-access-token --resource https://management.azure.com/ -o json
az account get-access-token --resource https://vault.azure.net/ -o json
az account get-access-token --resource https://graph.microsoft.com/ -o json
```

## Configuration

```bash
# Set defaults (reduces repetition in commands)
az config set defaults.location=westeurope
az config set defaults.group=my-resource-group

# View config
az config get

# Unset
az config unset defaults.location

# Per-command overrides always take precedence
az vm create --location eastus ...  # overrides default
```

### Region Consistency

Related Azure resources should be in the same region. Before creating any resource:

```bash
# Check defaults
az config get defaults.location 2>/dev/null

# List available locations
az account list-locations --query "[].name" -o tsv
```

Common regions: `westeurope`, `northeurope`, `eastus`, `eastus2`, `westus2`, `centralus`
