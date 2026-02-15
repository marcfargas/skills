# Serverless & Containers: App Service, Functions, Container Apps, AKS, ACR

## App Service (Web Apps)

```bash
# Create App Service plan
az appservice plan create \
  --resource-group my-rg \
  --name my-plan \
  --sku B1 \
  --is-linux

# WRITE — create web app (Node.js)
az webapp create \
  --resource-group my-rg \
  --plan my-plan \
  --name my-webapp \
  --runtime "NODE:20-lts"

# Deploy from local source (zip deploy)
az webapp up --resource-group my-rg --name my-webapp --runtime "NODE:20-lts"

# Deploy from GitHub
az webapp deployment source config \
  --resource-group my-rg \
  --name my-webapp \
  --repo-url https://github.com/user/repo \
  --branch main

# Deploy from container image
az webapp create \
  --resource-group my-rg \
  --plan my-plan \
  --name my-webapp \
  --deployment-container-image-name myregistry.azurecr.io/myimage:tag

# READ
az webapp list --resource-group my-rg -o table
az webapp show --name my-webapp --resource-group my-rg -o json
az webapp log tail --name my-webapp --resource-group my-rg

# WRITE — app settings (env vars)
az webapp config appsettings set \
  --resource-group my-rg \
  --name my-webapp \
  --settings KEY=value DB_HOST=mydb.postgres.database.azure.com

az webapp config appsettings list --resource-group my-rg --name my-webapp -o json

# WRITE — connection strings
az webapp config connection-string set \
  --resource-group my-rg \
  --name my-webapp \
  --connection-string-type PostgreSQL \
  --settings MyDB="host=...;database=...;user=...;password=..."

# Scale
az appservice plan update --name my-plan --resource-group my-rg --sku S1
az webapp scale --name my-webapp --resource-group my-rg --instance-count 3

# Deployment slots
az webapp deployment slot create --name my-webapp --resource-group my-rg --slot staging
az webapp deployment slot swap --name my-webapp --resource-group my-rg --slot staging --target-slot production

# Custom domain
az webapp config hostname add --webapp-name my-webapp --resource-group my-rg --hostname www.example.com
az webapp config ssl bind --certificate-thumbprint THUMBPRINT --ssl-type SNI \
  --name my-webapp --resource-group my-rg

# Restart / stop
az webapp restart --name my-webapp --resource-group my-rg
az webapp stop --name my-webapp --resource-group my-rg
az webapp start --name my-webapp --resource-group my-rg

# ⚠️ DESTRUCTIVE
az webapp delete --name my-webapp --resource-group my-rg
az appservice plan delete --name my-plan --resource-group my-rg
```

### App Service Pricing

| SKU | ~Cost/mo | vCPU | RAM | Notes |
|-----|----------|------|-----|-------|
| F1 | Free | Shared | 1 GB | Dev/test, 60 min/day |
| B1 | ~$13 | 1 | 1.75 GB | Basic |
| S1 | ~$73 | 1 | 1.75 GB | Standard, slots, autoscale |
| P1v3 | ~$138 | 2 | 8 GB | Premium, VNet integration |

## Azure Functions

```bash
# Create Function App (Consumption plan — pay per execution)
az functionapp create \
  --resource-group my-rg \
  --name my-func \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 20 \
  --storage-account mystorageaccount \
  --functions-version 4

# Deploy from local
func azure functionapp publish my-func

# Or with zip deploy
az functionapp deployment source config-zip \
  --resource-group my-rg \
  --name my-func \
  --src app.zip

# READ
az functionapp list --resource-group my-rg -o table
az functionapp show --name my-func --resource-group my-rg -o json
az functionapp function list --name my-func --resource-group my-rg -o json

# App settings
az functionapp config appsettings set \
  --resource-group my-rg \
  --name my-func \
  --settings KEY=value

# ⚠️ DESTRUCTIVE
az functionapp delete --name my-func --resource-group my-rg
```

## Container Apps

```bash
# Create Container Apps environment
az containerapp env create \
  --resource-group my-rg \
  --name my-env \
  --location westeurope

# WRITE — deploy container app
az containerapp create \
  --resource-group my-rg \
  --name my-app \
  --environment my-env \
  --image myregistry.azurecr.io/myimage:tag \
  --target-port 8080 \
  --ingress external \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 0 --max-replicas 5

# Deploy from source (buildpack)
az containerapp up --name my-app --resource-group my-rg --source .

# READ
az containerapp list --resource-group my-rg -o table
az containerapp show --name my-app --resource-group my-rg -o json
az containerapp logs show --name my-app --resource-group my-rg

# Update image
az containerapp update --name my-app --resource-group my-rg \
  --image myregistry.azurecr.io/myimage:newtag

# Scale rules
az containerapp update --name my-app --resource-group my-rg \
  --min-replicas 1 --max-replicas 10

# Environment variables / secrets
az containerapp update --name my-app --resource-group my-rg \
  --set-env-vars "KEY=value" "SECRET=secretref:my-secret"

# Revisions
az containerapp revision list --name my-app --resource-group my-rg -o table

# ⚠️ DESTRUCTIVE
az containerapp delete --name my-app --resource-group my-rg
az containerapp env delete --name my-env --resource-group my-rg
```

## Azure Kubernetes Service (AKS)

```bash
# ⚠️ EXPENSIVE — ~$70+/month for 3-node Standard_B2s cluster (+ node costs)
az aks create \
  --resource-group my-rg \
  --name my-cluster \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys \
  --location westeurope

# Get kubectl credentials
az aks get-credentials --resource-group my-rg --name my-cluster

# READ
az aks list -o table
az aks show --name my-cluster --resource-group my-rg -o json
az aks nodepool list --cluster-name my-cluster --resource-group my-rg -o table

# Scale
az aks scale --name my-cluster --resource-group my-rg --node-count 5
az aks nodepool scale --cluster-name my-cluster --resource-group my-rg \
  --name nodepool1 --node-count 2

# Enable autoscaler
az aks update --name my-cluster --resource-group my-rg \
  --enable-cluster-autoscaler --min-count 1 --max-count 10

# Upgrade
az aks get-upgrades --name my-cluster --resource-group my-rg -o table
az aks upgrade --name my-cluster --resource-group my-rg --kubernetes-version 1.29.0

# ⚠️ DESTRUCTIVE
az aks delete --name my-cluster --resource-group my-rg
```

## Azure Container Registry (ACR)

```bash
# Create registry
az acr create --resource-group my-rg --name myregistry --sku Basic

# Login to registry
az acr login --name myregistry

# Build and push (ACR Tasks — no local Docker needed)
az acr build --registry myregistry --image myimage:tag .

# Tag and push (local Docker)
docker tag myimage myregistry.azurecr.io/myimage:tag
docker push myregistry.azurecr.io/myimage:tag

# READ
az acr list -o table
az acr repository list --name myregistry -o json
az acr repository show-tags --name myregistry --repository myimage -o json

# ⚠️ DESTRUCTIVE
az acr repository delete --name myregistry --repository myimage --tag tag
az acr delete --name myregistry --resource-group my-rg
```

### Grant AKS access to ACR

```bash
az aks update --name my-cluster --resource-group my-rg --attach-acr myregistry
```
