# Compute Engine & Networking

## Compute Engine

```bash
# READ — list instances
gcloud compute instances list --format=json
gcloud compute instances list --filter="status=RUNNING AND zone:europe-west1" --format=json

# EXPENSIVE — create instance (~$5-2000+/mo depending on type)
gcloud compute instances create my-vm \
  --zone=europe-west1-b \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --tags=http-server

# SSH (uses IAP tunneling by default — secure)
gcloud compute ssh my-vm --zone=europe-west1-b
gcloud compute ssh my-vm --zone=europe-west1-b --tunnel-through-iap  # explicit

# SCP
gcloud compute scp local.txt my-vm:~/remote.txt --zone=europe-west1-b

# Lifecycle
gcloud compute instances stop my-vm --zone=europe-west1-b
gcloud compute instances start my-vm --zone=europe-west1-b

# ⚠️ DESTRUCTIVE
gcloud compute instances delete my-vm --zone=europe-west1-b
```

## Firewall Rules

```bash
# READ
gcloud compute firewall-rules list --format=json

# ⚠️ SECURITY — opens network ports
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 --target-tags=http-server --network=default

gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 --target-tags=https-server --network=default

# ⚠️ DESTRUCTIVE
gcloud compute firewall-rules delete allow-http
```

## VPC & Subnets

```bash
# Create VPC
gcloud compute networks create my-vpc --subnet-mode=auto
gcloud compute networks list --format=json

# Create subnet
gcloud compute networks subnets create my-subnet \
  --network=my-vpc --range=10.0.0.0/24 --region=europe-west1

gcloud compute networks subnets list --format=json
```

## Static IPs

```bash
gcloud compute addresses create my-ip --region=europe-west1
gcloud compute addresses list --format=json

# ⚠️ Unattached static IPs cost ~$2.88/month
```

## DNS

```bash
gcloud dns managed-zones create my-zone \
  --dns-name="example.com." --description="My zone"

gcloud dns record-sets list --zone=my-zone --format=json

# Add A record
gcloud dns record-sets create www.example.com. \
  --zone=my-zone --type=A --ttl=300 --rrdatas="1.2.3.4"
```

## Load Balancing (overview)

```bash
gcloud compute backend-services list --format=json
gcloud compute url-maps list --format=json
gcloud compute forwarding-rules list --format=json

# ⚠️ EXPENSIVE — load balancers cost ~$18+/month
```

## Logging & Monitoring

```bash
# Read logs
gcloud logging read "resource.type=gce_instance" --limit=20 --format=json
gcloud logging read "severity>=ERROR AND timestamp>=\"$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)\"" --limit=50 --format=json

# Tail logs (live)
gcloud logging tail "resource.type=gce_instance"

# Write log entry
gcloud logging write my-log "Test message" --severity=INFO

# Monitoring
gcloud monitoring dashboards list --format=json
gcloud monitoring policies list --format=json  # alert policies
```
