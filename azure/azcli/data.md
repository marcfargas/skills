# Data: SQL Database, Cosmos DB, Service Bus, Event Hubs

## Azure SQL Database

```bash
# Create SQL server (logical server — required before creating databases)
# ⚠️ Never put password in CLI args — use Key Vault
ADMIN_PWD=$(az keyvault secret show --vault-name my-vault --name sql-admin-pwd --query value -o tsv)

az sql server create \
  --resource-group my-rg \
  --name my-sql-server \
  --location westeurope \
  --admin-user sqladmin \
  --admin-password "$ADMIN_PWD"

# ⚠️ EXPENSIVE — create database (~$5-2000+/mo depending on tier)
az sql db create \
  --resource-group my-rg \
  --server my-sql-server \
  --name my-database \
  --edition GeneralPurpose \
  --compute-model Serverless \
  --family Gen5 \
  --capacity 1 \
  --auto-pause-delay 60

# Serverless DTU-based (cheapest for dev/test)
az sql db create \
  --resource-group my-rg \
  --server my-sql-server \
  --name my-database \
  --edition Basic \
  --capacity 5

# READ
az sql server list --resource-group my-rg -o json
az sql db list --server my-sql-server --resource-group my-rg -o table
az sql db show --name my-database --server my-sql-server --resource-group my-rg -o json

# Firewall rules
# ⚠️ SECURITY — allow Azure services
az sql server firewall-rule create \
  --resource-group my-rg \
  --server my-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# ⚠️ SECURITY — allow specific IP
az sql server firewall-rule create \
  --resource-group my-rg \
  --server my-sql-server \
  --name my-ip \
  --start-ip-address 1.2.3.4 \
  --end-ip-address 1.2.3.4

az sql server firewall-rule list --server my-sql-server --resource-group my-rg -o table

# Connection string
echo "Server=tcp:my-sql-server.database.windows.net,1433;Database=my-database;User ID=sqladmin;Password=...;Encrypt=yes"

# ⚠️ DESTRUCTIVE
az sql db delete --name my-database --server my-sql-server --resource-group my-rg
az sql server delete --name my-sql-server --resource-group my-rg
```

### SQL Database Pricing

| Edition | ~Cost/mo | Notes |
|---------|----------|-------|
| Basic (5 DTU) | ~$5 | Dev/test |
| Standard (S0) | ~$15 | Small workloads |
| GP Serverless vCore | ~$0.50/hr (auto-pause) | Auto-pause saves cost |
| Business Critical | ~$400+ | High IOPS, readable secondary |

## Azure Database for PostgreSQL (Flexible Server)

```bash
# ⚠️ EXPENSIVE
az postgres flexible-server create \
  --resource-group my-rg \
  --name my-pg-server \
  --location westeurope \
  --admin-user pgadmin \
  --admin-password "$ADMIN_PWD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# Create database
az postgres flexible-server db create \
  --resource-group my-rg \
  --server-name my-pg-server \
  --database-name mydb

# READ
az postgres flexible-server list --resource-group my-rg -o table
az postgres flexible-server show --name my-pg-server --resource-group my-rg -o json
az postgres flexible-server db list --resource-group my-rg --server-name my-pg-server -o table

# Firewall
az postgres flexible-server firewall-rule create \
  --resource-group my-rg \
  --name my-pg-server \
  --rule-name allow-my-ip \
  --start-ip-address 1.2.3.4 \
  --end-ip-address 1.2.3.4

# Connect
az postgres flexible-server connect --name my-pg-server --admin-user pgadmin --admin-password "$ADMIN_PWD" --database-name mydb

# ⚠️ DESTRUCTIVE
az postgres flexible-server delete --name my-pg-server --resource-group my-rg
```

## Cosmos DB

```bash
# Create account (multi-region, multi-model)
az cosmosdb create \
  --resource-group my-rg \
  --name my-cosmos \
  --kind GlobalDocumentDB \
  --locations regionName=westeurope failoverPriority=0

# Create SQL database (Core/SQL API)
az cosmosdb sql database create \
  --account-name my-cosmos \
  --resource-group my-rg \
  --name mydb

# Create container (collection)
az cosmosdb sql container create \
  --account-name my-cosmos \
  --resource-group my-rg \
  --database-name mydb \
  --name mycontainer \
  --partition-key-path "/partitionKey" \
  --throughput 400

# READ
az cosmosdb list --resource-group my-rg -o json
az cosmosdb show --name my-cosmos --resource-group my-rg -o json
az cosmosdb sql database list --account-name my-cosmos --resource-group my-rg -o table

# Get connection keys
az cosmosdb keys list --name my-cosmos --resource-group my-rg -o json

# ⚠️ DESTRUCTIVE
az cosmosdb sql container delete --account-name my-cosmos --resource-group my-rg --database-name mydb --name mycontainer
az cosmosdb delete --name my-cosmos --resource-group my-rg
```

## Service Bus

```bash
# Create namespace
az servicebus namespace create \
  --resource-group my-rg \
  --name my-sb-ns \
  --location westeurope \
  --sku Standard

# Queues
az servicebus queue create --resource-group my-rg --namespace-name my-sb-ns --name my-queue
az servicebus queue list --resource-group my-rg --namespace-name my-sb-ns -o table

# Topics & Subscriptions
az servicebus topic create --resource-group my-rg --namespace-name my-sb-ns --name my-topic
az servicebus topic subscription create \
  --resource-group my-rg --namespace-name my-sb-ns \
  --topic-name my-topic --name my-sub

# Get connection string
az servicebus namespace authorization-rule keys list \
  --resource-group my-rg --namespace-name my-sb-ns \
  --name RootManageSharedAccessKey --query primaryConnectionString -o tsv

# ⚠️ DESTRUCTIVE
az servicebus queue delete --resource-group my-rg --namespace-name my-sb-ns --name my-queue
az servicebus topic delete --resource-group my-rg --namespace-name my-sb-ns --name my-topic
az servicebus namespace delete --resource-group my-rg --name my-sb-ns
```

## Event Hubs

```bash
# Create namespace
az eventhubs namespace create \
  --resource-group my-rg \
  --name my-eh-ns \
  --location westeurope \
  --sku Standard

# Create event hub
az eventhubs eventhub create \
  --resource-group my-rg \
  --namespace-name my-eh-ns \
  --name my-hub \
  --partition-count 4 \
  --message-retention 1

# Consumer groups
az eventhubs eventhub consumer-group create \
  --resource-group my-rg --namespace-name my-eh-ns \
  --eventhub-name my-hub --name my-cg

# READ
az eventhubs eventhub list --resource-group my-rg --namespace-name my-eh-ns -o table

# Get connection string
az eventhubs namespace authorization-rule keys list \
  --resource-group my-rg --namespace-name my-eh-ns \
  --name RootManageSharedAccessKey --query primaryConnectionString -o tsv

# ⚠️ DESTRUCTIVE
az eventhubs eventhub delete --resource-group my-rg --namespace-name my-eh-ns --name my-hub
az eventhubs namespace delete --resource-group my-rg --name my-eh-ns
```
