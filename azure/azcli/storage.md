# Storage: Accounts, Blobs, File Shares, Queues, Tables

## Storage Accounts

```bash
# Check name availability (globally unique)
az storage account check-name --name mystorageaccount -o json

# Create
az storage account create \
  --resource-group my-rg \
  --name mystorageaccount \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2

# READ
az storage account list --resource-group my-rg -o table
az storage account show --name mystorageaccount --resource-group my-rg -o json

# Get connection string (for apps)
az storage account show-connection-string --name mystorageaccount -o tsv

# Get access keys
az storage account keys list --account-name mystorageaccount -o json

# ⚠️ SECURITY — regenerate key (invalidates existing connections using that key)
az storage account keys renew --account-name mystorageaccount --key primary

# ⚠️ DESTRUCTIVE
az storage account delete --name mystorageaccount --resource-group my-rg
```

### SKU Reference

| SKU | Redundancy | ~Cost (100GB/mo) |
|-----|-----------|-------------------|
| `Standard_LRS` | Local (3 copies, 1 datacenter) | ~$2 |
| `Standard_ZRS` | Zone (3 zones) | ~$2.50 |
| `Standard_GRS` | Geo (2 regions) | ~$4 |
| `Premium_LRS` | Local, SSD | ~$15 |

## Blob Storage

### Auth for blob commands

```bash
# Option 1: Use login credentials (RBAC — preferred)
# Requires "Storage Blob Data Contributor" role
az storage blob list --account-name mystorageaccount --container-name mycontainer --auth-mode login -o table

# Option 2: Connection string (convenient for scripts)
export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name mystorageaccount -o tsv)

# Option 3: Account key
export AZURE_STORAGE_KEY=$(az storage account keys list --account-name mystorageaccount --query "[0].value" -o tsv)
```

### Containers

```bash
# Create container
az storage container create --name mycontainer --account-name mystorageaccount

# List containers
az storage container list --account-name mystorageaccount -o table

# ⚠️ DESTRUCTIVE
az storage container delete --name mycontainer --account-name mystorageaccount
```

### Upload & Download

```bash
# Upload single file
az storage blob upload \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --file ./local.txt \
  --name remote.txt

# Upload directory (batch)
az storage blob upload-batch \
  --account-name mystorageaccount \
  --destination mycontainer \
  --source ./local-dir

# Download
az storage blob download \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name remote.txt \
  --file ./local.txt

# Download directory
az storage blob download-batch \
  --account-name mystorageaccount \
  --source mycontainer \
  --destination ./local-dir

# Copy between containers/accounts
az storage blob copy start \
  --destination-container dest-container \
  --destination-blob dest.txt \
  --source-uri "https://sourceaccount.blob.core.windows.net/source-container/source.txt" \
  --account-name destaccount
```

### List & Info

```bash
az storage blob list --account-name mystorageaccount --container-name mycontainer -o table
az storage blob show --account-name mystorageaccount --container-name mycontainer --name myfile.txt -o json

# Show blob content (small files)
az storage blob download --account-name mystorageaccount --container-name mycontainer --name myfile.txt --file /dev/stdout
```

### Delete

```bash
# ⚠️ DESTRUCTIVE
az storage blob delete --account-name mystorageaccount --container-name mycontainer --name myfile.txt

# Batch delete
az storage blob delete-batch --account-name mystorageaccount --source mycontainer --pattern "*.tmp"
```

### SAS Tokens

```bash
# Generate SAS for a blob (time-limited access)
END=$(date -u -d "+1 hour" +%Y-%m-%dT%H:%MZ)
az storage blob generate-sas \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myfile.txt \
  --permissions r \
  --expiry "$END" \
  --auth-mode key -o tsv

# Generate SAS for entire container
az storage container generate-sas \
  --account-name mystorageaccount \
  --name mycontainer \
  --permissions rl \
  --expiry "$END" \
  --auth-mode key -o tsv
```

## File Shares (Azure Files)

```bash
# Create share
az storage share create --name myshare --account-name mystorageaccount --quota 5

# Upload
az storage file upload --share-name myshare --source ./local.txt --account-name mystorageaccount

# Download
az storage file download --share-name myshare --path remote.txt --dest ./local.txt --account-name mystorageaccount

# List
az storage file list --share-name myshare --account-name mystorageaccount -o table

# Create directory
az storage directory create --share-name myshare --name mydir --account-name mystorageaccount

# ⚠️ DESTRUCTIVE
az storage share delete --name myshare --account-name mystorageaccount
```

## Queues

```bash
az storage queue create --name myqueue --account-name mystorageaccount
az storage queue list --account-name mystorageaccount -o table

# Put message
az storage message put --queue-name myqueue --content "Hello" --account-name mystorageaccount

# Peek (read without removing)
az storage message peek --queue-name myqueue --account-name mystorageaccount -o json

# Get (read and start visibility timeout)
az storage message get --queue-name myqueue --account-name mystorageaccount -o json

# ⚠️ DESTRUCTIVE
az storage queue delete --name myqueue --account-name mystorageaccount
```

## Tables

```bash
az storage table create --name mytable --account-name mystorageaccount
az storage table list --account-name mystorageaccount -o table

# ⚠️ DESTRUCTIVE
az storage table delete --name mytable --account-name mystorageaccount
```

## azcopy (Bulk Transfers)

For large-scale transfers, use `azcopy` instead of `az storage blob`:

```bash
# Login (uses Azure AD)
azcopy login

# Sync local → blob
azcopy sync ./local-dir "https://mystorageaccount.blob.core.windows.net/mycontainer" --recursive

# Copy with SAS
azcopy copy ./local.txt "https://mystorageaccount.blob.core.windows.net/mycontainer/remote.txt?$SAS_TOKEN"
```
