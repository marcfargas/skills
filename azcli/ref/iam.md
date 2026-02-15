# IAM, Resources & Key Vault

## Resource Groups

Resource groups are the fundamental container for all Azure resources.

```bash
# CREATE
az group create --name my-rg --location westeurope

# READ
az group list -o json
az group show --name my-rg -o json
az group exists --name my-rg   # returns true/false

# List resources in a group
az resource list --resource-group my-rg -o table

# ⚠️ DESTRUCTIVE — deletes ALL resources inside the group
az group delete --name my-rg

# Tags
az group update --name my-rg --tags env=dev team=backend
```

## RBAC (Role-Based Access Control)

```bash
# List role assignments on a resource group
az role assignment list --resource-group my-rg -o json

# List role assignments for a specific user/SP
az role assignment list --assignee user@example.com -o json

# WRITE — grant role (confirm with user)
az role assignment create \
  --assignee user@example.com \
  --role "Contributor" \
  --scope /subscriptions/SUB_ID/resourceGroups/my-rg

# Grant role to service principal
az role assignment create \
  --assignee SP_APP_ID \
  --role "Reader" \
  --scope /subscriptions/SUB_ID/resourceGroups/my-rg

# ⚠️ DESTRUCTIVE — remove role
az role assignment delete \
  --assignee user@example.com \
  --role "Contributor" \
  --scope /subscriptions/SUB_ID/resourceGroups/my-rg

# List available role definitions
az role definition list --query "[].{Name:roleName, Description:description}" -o table
az role definition list --name "Contributor" -o json
```

> **Least privilege**: Prefer specific roles (e.g., `Storage Blob Data Reader`)
> over broad ones (`Contributor`, `Owner`). Never grant `Owner` to automation.

### Common Built-in Roles

| Role | Scope |
|------|-------|
| `Reader` | View all resources, no changes |
| `Contributor` | Manage all resources, no RBAC/policy changes |
| `Owner` | Full access including RBAC |
| `Storage Blob Data Contributor` | Read/write/delete blobs |
| `Key Vault Secrets User` | Read secrets |
| `AcrPush` | Push images to Container Registry |
| `Website Contributor` | Manage web apps |

## Entra ID (Azure AD)

```bash
# Users
az ad user list --query "[].{Name:displayName, UPN:userPrincipalName}" -o table
az ad user show --id user@example.com -o json

# Service Principals
az ad sp list --display-name "my-sp" -o json
az ad sp show --id SP_APP_ID -o json

# App Registrations
az ad app list --display-name "my-app" -o json
az ad app show --id APP_ID -o json

# Create app registration
az ad app create --display-name "my-app"

# Create service principal for the app
az ad sp create --id APP_ID

# ⚠️ SECURITY — create client secret (shown only once)
az ad app credential reset --id APP_ID --append

# Groups
az ad group list -o table
az ad group member list --group "My Group" -o table
az ad group member add --group "My Group" --member-id USER_OBJECT_ID
```

> ⚠️ **FORBIDDEN**: Do not use `az ad app credential reset` with `--password`
> plaintext argument. Always let Azure generate the secret or use certificates.

## Key Vault

```bash
# Create vault
az keyvault create --name my-vault --resource-group my-rg --location westeurope

# READ
az keyvault list -o json
az keyvault show --name my-vault -o json

# --- Secrets ---
# Set secret (pipe or use --file, avoid plaintext in CLI args)
az keyvault secret set --vault-name my-vault --name my-secret --value "$(cat secret.txt)"

# Get secret value
az keyvault secret show --vault-name my-vault --name my-secret --query value -o tsv

# List secrets
az keyvault secret list --vault-name my-vault -o table

# New version (just set again — versions are automatic)
az keyvault secret set --vault-name my-vault --name my-secret --value "new-value"

# ⚠️ DESTRUCTIVE — soft-delete (recoverable)
az keyvault secret delete --vault-name my-vault --name my-secret

# ⚠️ DESTRUCTIVE — purge (permanent, not recoverable)
az keyvault secret purge --vault-name my-vault --name my-secret

# --- Keys ---
az keyvault key create --vault-name my-vault --name my-key --kty RSA --size 2048
az keyvault key list --vault-name my-vault -o json

# --- Certificates ---
az keyvault certificate create --vault-name my-vault --name my-cert --policy @policy.json
az keyvault certificate list --vault-name my-vault -o json

# --- Access Policies ---
# Grant access to a service principal
az keyvault set-policy --name my-vault \
  --spn SP_APP_ID \
  --secret-permissions get list

# Grant access to a user
az keyvault set-policy --name my-vault \
  --upn user@example.com \
  --secret-permissions get list set delete

# ⚠️ DESTRUCTIVE — delete vault
az keyvault delete --name my-vault --resource-group my-rg
az keyvault purge --name my-vault --location westeurope  # permanent
```

## Resource Locks

```bash
# Prevent accidental deletion
az lock create --name no-delete --resource-group my-rg --lock-type CanNotDelete

# Prevent any changes
az lock create --name read-only --resource-group my-rg --lock-type ReadOnly

# List & remove
az lock list --resource-group my-rg -o table
az lock delete --name no-delete --resource-group my-rg
```

## Resource Providers

```bash
# List registered providers
az provider list --query "[?registrationState=='Registered'].namespace" -o tsv

# Check specific provider
az provider show --namespace Microsoft.ContainerApp --query registrationState -o tsv

# Register (required before first use of some services)
az provider register --namespace Microsoft.ContainerApp --wait
```
