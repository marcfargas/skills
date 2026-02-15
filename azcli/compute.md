# Compute & Networking

## Virtual Machines

```bash
# READ — list VMs
az vm list -o json
az vm list --resource-group my-rg -o table
az vm list --resource-group my-rg --query "[].{Name:name, Size:hardwareProfile.vmSize, Status:powerState}" -o table

# Show VM details
az vm show --name my-vm --resource-group my-rg -o json

# Show VM with instance view (power state)
az vm get-instance-view --name my-vm --resource-group my-rg \
  --query "{Name:name, Status:instanceView.statuses[1].displayStatus}" -o json

# EXPENSIVE — create VM (~$5-2000+/mo depending on size)
az vm create \
  --resource-group my-rg \
  --name my-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --location westeurope

# Windows VM
az vm create \
  --resource-group my-rg \
  --name my-win-vm \
  --image Win2022Datacenter \
  --size Standard_B2s \
  --admin-username azureuser \
  --admin-password "$(az keyvault secret show --vault-name my-vault --name vm-pwd --query value -o tsv)"

# SSH into VM
az ssh vm --resource-group my-rg --name my-vm
# Or with native SSH (needs public IP)
ssh azureuser@$(az vm show --name my-vm -g my-rg --show-details --query publicIps -o tsv)

# Lifecycle
az vm start --name my-vm --resource-group my-rg
az vm stop --name my-vm --resource-group my-rg        # still billed for compute
az vm deallocate --name my-vm --resource-group my-rg   # stops billing for compute
az vm restart --name my-vm --resource-group my-rg

# Resize
az vm resize --name my-vm --resource-group my-rg --size Standard_B4ms

# ⚠️ DESTRUCTIVE
az vm delete --name my-vm --resource-group my-rg
```

### VM Images

```bash
# List popular images
az vm image list -o table                         # cached popular images
az vm image list --all --publisher Canonical -o table  # all from publisher (slow)
az vm image list --offer UbuntuServer --sku 22_04 --all -o table

# List available sizes in a region
az vm list-sizes --location westeurope -o table
az vm list-sizes --location westeurope --query "[?numberOfCores<=`4`]" -o table
```

## Network Security Groups (NSGs)

```bash
# Create NSG
az network nsg create --resource-group my-rg --name my-nsg

# READ
az network nsg list --resource-group my-rg -o json
az network nsg rule list --nsg-name my-nsg --resource-group my-rg -o table

# ⚠️ SECURITY — open ports
az network nsg rule create \
  --resource-group my-rg \
  --nsg-name my-nsg \
  --name allow-http \
  --priority 100 \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 80 443 \
  --direction Inbound

# ⚠️ DESTRUCTIVE
az network nsg rule delete --resource-group my-rg --nsg-name my-nsg --name allow-http
az network nsg delete --resource-group my-rg --name my-nsg
```

## Virtual Networks (VNets)

```bash
# Create VNet with subnet
az network vnet create \
  --resource-group my-rg \
  --name my-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name default \
  --subnet-prefix 10.0.0.0/24

# READ
az network vnet list --resource-group my-rg -o json
az network vnet show --name my-vnet --resource-group my-rg -o json

# Add subnet
az network vnet subnet create \
  --resource-group my-rg \
  --vnet-name my-vnet \
  --name backend-subnet \
  --address-prefixes 10.0.1.0/24

# List subnets
az network vnet subnet list --resource-group my-rg --vnet-name my-vnet -o table

# ⚠️ DESTRUCTIVE
az network vnet delete --name my-vnet --resource-group my-rg
```

## Public IPs

```bash
az network public-ip create --resource-group my-rg --name my-ip --sku Standard
az network public-ip list --resource-group my-rg -o table
az network public-ip show --name my-ip --resource-group my-rg --query ipAddress -o tsv

# ⚠️ Unattached static IPs cost ~$3.65/month
```

## DNS Zones

```bash
# Create zone
az network dns zone create --resource-group my-rg --name example.com

# READ
az network dns zone list --resource-group my-rg -o json
az network dns record-set list --resource-group my-rg --zone-name example.com -o table

# Add A record
az network dns record-set a add-record \
  --resource-group my-rg \
  --zone-name example.com \
  --record-set-name www \
  --ipv4-address 1.2.3.4

# Add CNAME
az network dns record-set cname set-record \
  --resource-group my-rg \
  --zone-name example.com \
  --record-set-name app \
  --cname my-app.azurewebsites.net

# ⚠️ DESTRUCTIVE
az network dns record-set a remove-record \
  --resource-group my-rg --zone-name example.com \
  --record-set-name www --ipv4-address 1.2.3.4
```

## Private DNS

```bash
az network private-dns zone create --resource-group my-rg --name private.example.com
az network private-dns link vnet create \
  --resource-group my-rg \
  --zone-name private.example.com \
  --name my-link \
  --virtual-network my-vnet \
  --registration-enabled false
```

## Load Balancer

```bash
# ⚠️ EXPENSIVE — Standard LB ~$18+/month + data processing
az network lb create \
  --resource-group my-rg \
  --name my-lb \
  --sku Standard \
  --public-ip-address my-ip \
  --frontend-ip-name myFrontEnd \
  --backend-pool-name myBackendPool

az network lb list --resource-group my-rg -o json
```

## Application Gateway

```bash
# ⚠️ EXPENSIVE — ~$20+/month (WAF v2 ~$200+/month)
az network application-gateway list --resource-group my-rg -o json
```

## Azure Monitor & Logging

```bash
# Activity log (audit trail)
az monitor activity-log list --resource-group my-rg --max-events 20 -o json

# Metrics
az monitor metrics list \
  --resource "/subscriptions/SUB_ID/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm" \
  --metric "Percentage CPU" \
  --interval PT1H -o json

# Log Analytics query
az monitor log-analytics query \
  --workspace WORKSPACE_ID \
  --analytics-query "AzureActivity | take 10" -o json

# Alerts
az monitor metrics alert list --resource-group my-rg -o json
az monitor metrics alert create \
  --name "high-cpu" \
  --resource-group my-rg \
  --scopes "/subscriptions/SUB_ID/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm" \
  --condition "avg Percentage CPU > 80" \
  --description "Alert when CPU exceeds 80%"
```
