# Automation, Scripting & CI/CD

## Output Formats

**Always use `-o json` for agent consumption.** Table output breaks parsing.

```bash
az vm list -o json                      # Full JSON
az vm list -o tsv                       # Tab-separated values
az vm list -o table                     # Human-readable table
az vm list -o yaml                      # YAML
az vm list -o jsonc                     # Colorized JSON (human)
az vm list --query "[].name" -o tsv     # Single column, one per line
```

## JMESPath Queries (`--query`)

Azure CLI uses JMESPath (not the `--filter` syntax of gcloud). Queries run **client-side**.

```bash
# Single field
az vm show -g my-rg -n my-vm --query "name" -o tsv

# Multiple fields (dictionary)
az vm show -g my-rg -n my-vm --query "{Name:name, Size:hardwareProfile.vmSize}" -o json

# Array projection
az vm list --query "[].{Name:name, RG:resourceGroup, Size:hardwareProfile.vmSize}" -o table

# Filter array
az vm list --query "[?location=='westeurope'].name" -o tsv

# Contains (string search)
az vm list --query "[?contains(name, 'web')].{Name:name, Location:location}" -o table

# Nested access
az vm show -g my-rg -n my-vm --query "osProfile.adminUsername" -o tsv

# First item
az vm list --query "[0].name" -o tsv

# Count
az vm list --query "length([])" -o tsv

# Pipe (apply after flattening)
az vm list --query "[].{Name:name, OS:storageProfile.osDisk.osType} | [?OS=='Linux']" -o table

# Sort
az vm list --query "sort_by([], &name)[].{Name:name, Location:location}" -o table
```

### JMESPath Tips for Agents

- Always use single quotes around JMESPath in Git Bash
- `--query "[].field"` returns a flat list
- `--query "{Alias:field}"` returns a renamed dictionary
- Combine `--query` + `-o tsv` for scriptable single values
- JMESPath is case-sensitive

## Idempotent Patterns

```bash
# Check-before-create
if ! az group show --name my-rg &>/dev/null; then
  az group create --name my-rg --location westeurope
else
  echo "Resource group already exists"
fi

# Using `az group exists`
if [ "$(az group exists --name my-rg)" = "false" ]; then
  az group create --name my-rg --location westeurope
fi

# Delete-if-exists (suppress error)
az vm delete --name my-vm --resource-group my-rg --yes 2>/dev/null || true
```

## Error Handling

```bash
# Capture and check
OUTPUT=$(az vm create --resource-group my-rg --name my-vm --image Ubuntu2204 2>&1)
if [ $? -ne 0 ]; then
  echo "Error: $OUTPUT" >&2
  exit 1
fi

# Retry with backoff
for i in 1 2 3 4 5; do
  az webapp up --name my-app --resource-group my-rg && break
  echo "Attempt $i failed, retrying in $((i * 5))s..."
  sleep $((i * 5))
done
```

## Waiting for Long-Running Operations

Many Azure operations return before completion. Use `--no-wait` + explicit polling.

```bash
# Option 1: Synchronous (default — blocks until done)
az vm create --resource-group my-rg --name my-vm --image Ubuntu2204

# Option 2: Async + poll
az vm create --resource-group my-rg --name my-vm --image Ubuntu2204 --no-wait
az vm wait --name my-vm --resource-group my-rg --created
az vm wait --name my-vm --resource-group my-rg --custom "powerState=='VM running'"

# Wait conditions: --created, --updated, --deleted, --exists, --custom "JMESPath expr"
```

## Bicep (Infrastructure as Code)

Bicep is Azure's native IaC language (compiles to ARM JSON).

```bash
# Install/upgrade Bicep
az bicep install
az bicep upgrade

# Deploy Bicep template
az deployment group create \
  --resource-group my-rg \
  --template-file main.bicep \
  --parameters @parameters.json

# What-if (dry run — shows changes without applying)
az deployment group what-if \
  --resource-group my-rg \
  --template-file main.bicep \
  --parameters @parameters.json

# Subscription-level deployment
az deployment sub create \
  --location westeurope \
  --template-file main.bicep

# List deployments
az deployment group list --resource-group my-rg -o table

# Show deployment details (includes outputs)
az deployment group show --name my-deployment --resource-group my-rg -o json

# Export existing resource as ARM/Bicep
az group export --name my-rg > exported.json
az bicep decompile --file exported.json  # Convert ARM → Bicep
```

## ARM Templates

```bash
# Deploy ARM template
az deployment group create \
  --resource-group my-rg \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json

# Deploy from URI
az deployment group create \
  --resource-group my-rg \
  --template-uri "https://raw.githubusercontent.com/.../azuredeploy.json"

# Validate (dry run)
az deployment group validate \
  --resource-group my-rg \
  --template-file azuredeploy.json
```

## CI/CD: GitHub Actions

### With Federated Credentials (OIDC — preferred, no secrets)

```yaml
permissions:
  id-token: write
  contents: read

steps:
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- run: az webapp deploy --name my-app --resource-group my-rg --src-path app.zip
```

Setup:
```bash
# Create app registration + federated credential
az ad app create --display-name "github-actions-myrepo"
APP_ID=$(az ad app list --display-name "github-actions-myrepo" --query "[0].appId" -o tsv)
az ad sp create --id $APP_ID

# Add federated credential for GitHub
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:ORG/REPO:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'

# Grant role
az role assignment create --assignee $APP_ID --role Contributor \
  --scope /subscriptions/SUB_ID/resourceGroups/my-rg
```

### With Service Principal Secret (fallback)

```yaml
steps:
- uses: azure/login@v2
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
    # JSON: {"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}

- run: az webapp deploy --name my-app --resource-group my-rg --src-path app.zip
```

## CI/CD: Azure DevOps Pipelines

```yaml
steps:
- task: AzureCLI@2
  inputs:
    azureSubscription: 'my-service-connection'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az webapp deploy --name my-app --resource-group my-rg --src-path app.zip
```

## Environment Variables

```bash
# Make scripts portable
RG="${AZURE_RESOURCE_GROUP:-my-default-rg}"
LOCATION="${AZURE_LOCATION:-westeurope}"
SUB="${AZURE_SUBSCRIPTION_ID:-}"

if [ -n "$SUB" ]; then
  az account set --subscription "$SUB"
fi
```

## Tags (Resource Organization)

```bash
# Tag a resource
az resource tag --tags env=production team=backend \
  --ids "/subscriptions/SUB_ID/resourceGroups/my-rg/providers/Microsoft.Web/sites/my-app"

# Tag a resource group
az group update --name my-rg --tags env=production

# Find resources by tag
az resource list --tag env=production -o table
```

## Azure Policy (overview)

```bash
# List assigned policies
az policy assignment list --resource-group my-rg -o table

# Show non-compliant resources
az policy state list --resource-group my-rg --filter "complianceState eq 'NonCompliant'" -o table
```
