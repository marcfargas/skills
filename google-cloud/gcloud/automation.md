# Automation, Scripting & CI/CD

## Output Formats

**Always use `--format=json` for agent consumption.** Table output breaks parsing.

```bash
gcloud compute instances list --format=json           # Full JSON
gcloud compute instances list --format="value(name)"  # Raw values, one per line
gcloud compute instances list --format="csv(name,zone,status)"
gcloud compute instances list --format="table(name,zone.basename(),machineType.basename(),status)"
```

## Filtering

```bash
# Server-side (efficient — sent to API)
gcloud compute instances list --filter="zone:europe-west1 AND status=RUNNING"
gcloud compute instances list --filter="name~^web-.*"          # regex
gcloud compute instances list --filter="NOT status=TERMINATED"
gcloud compute instances list --filter="createTime>2026-01-01"

# Combine with format + limit
gcloud compute instances list \
  --filter="status=RUNNING" \
  --format="value(name)" \
  --limit=10
```

## Idempotent Patterns

```bash
# Check-before-create
if ! gcloud compute instances describe my-vm --zone=europe-west1-b &>/dev/null; then
  gcloud compute instances create my-vm --zone=europe-west1-b --machine-type=e2-medium
else
  echo "Instance already exists"
fi

# Enable-if-not-enabled (safe to run multiple times)
gcloud services enable compute.googleapis.com

# Delete-if-exists (suppress error if already gone)
gcloud compute instances delete my-vm --zone=europe-west1-b --quiet 2>/dev/null || true
```

## Error Handling

```bash
# Capture and check
OUTPUT=$(gcloud compute instances create my-vm 2>&1)
if [ $? -ne 0 ]; then
  echo "Error: $OUTPUT" >&2
  exit 1
fi

# Retry with backoff
for i in 1 2 3 4 5; do
  gcloud run deploy my-service --source=. --region=europe-west1 && break
  echo "Attempt $i failed, retrying in $((i * 5))s..."
  sleep $((i * 5))
done
```

## Waiting for Long-Running Operations

Many GCP operations (SQL instances, GKE clusters, deployments) take minutes.

```bash
# Option 1: Synchronous (default — blocks until done)
# Most commands wait automatically. This is usually best.
gcloud sql instances create my-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=europe-west1

# Option 2: Async + explicit wait
gcloud compute instances create my-vm --zone=europe-west1-b --async --format="value(targetLink)"
gcloud compute operations wait OPERATION_NAME --zone=europe-west1-b

# Option 3: Poll pattern (for services without `wait`)
OPERATION=$(gcloud sql operations list --instance=my-db --filter="status=RUNNING" --format="value(name)" --limit=1)
while [ -n "$OPERATION" ]; do
  STATUS=$(gcloud sql operations describe "$OPERATION" --format="value(status)")
  if [[ "$STATUS" == "DONE" ]]; then
    echo "Operation complete"
    break
  fi
  echo "Status: $STATUS — waiting 10s..."
  sleep 10
done
```

**Agent note**: Default synchronous mode is usually best. Use `--async` only when
parallelizing multiple independent operations.

## Cloud Build

```bash
# Build and push container image
gcloud builds submit --tag=europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag .

# Build with config
gcloud builds submit --config=cloudbuild.yaml .

# List builds
gcloud builds list --format=json --limit=10

# View build logs
gcloud builds log BUILD_ID
```

## CI/CD: GitHub Actions

### With Workload Identity Federation (preferred — no keys)

```yaml
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: projects/PROJECT_NUM/locations/global/workloadIdentityPools/POOL/providers/PROVIDER
    service_account: SA_EMAIL

- uses: google-github-actions/setup-gcloud@v2

- run: gcloud run deploy my-service --image=IMG:${{ github.sha }} --region=europe-west1
```

### With Service Account Key (fallback)

```yaml
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- uses: google-github-actions/setup-gcloud@v2
```

## Environment Variables

```bash
# Make scripts portable
PROJECT_ID="${GCP_PROJECT_ID:-my-default-project}"
REGION="${GCP_REGION:-europe-west1}"

gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
```

## Vertex AI (overview)

```bash
# List models
gcloud ai models list --region=europe-west1 --format=json

# List endpoints
gcloud ai endpoints list --region=europe-west1 --format=json

# Deploy model to endpoint
gcloud ai endpoints deploy-model ENDPOINT_ID \
  --model=MODEL_ID \
  --region=europe-west1 \
  --display-name="v1"

# Predict
gcloud ai endpoints predict ENDPOINT_ID \
  --region=europe-west1 \
  --json-request=request.json
```
