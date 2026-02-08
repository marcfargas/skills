# Serverless: Cloud Run, Functions, App Engine, Scheduler, Tasks

## Cloud Run (Services)

```bash
# WRITE — deploy from container image
gcloud run deploy my-service \
  --image=europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag \
  --region=europe-west1 \
  --set-env-vars="KEY=value"

# Deploy from source (buildpacks — no Dockerfile needed)
gcloud run deploy my-service --source=. --region=europe-west1

# READ
gcloud run services list --format=json
gcloud run services describe my-service --region=europe-west1 --format=json
gcloud run services logs read my-service --region=europe-west1

# WRITE — update
gcloud run services update my-service --region=europe-west1 --memory=512Mi --cpu=1

# Traffic splitting
gcloud run services update-traffic my-service \
  --to-revisions=my-service-v1=50,my-service-v2=50

# ⚠️ SECURITY — exposes to public internet
gcloud run deploy my-service --allow-unauthenticated ...

# ⚠️ DESTRUCTIVE
gcloud run services delete my-service --region=europe-west1
```

## Cloud Run (Jobs — batch workloads)

```bash
# WRITE — create job
gcloud run jobs create my-job \
  --image=europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag \
  --region=europe-west1 \
  --tasks=10 --max-retries=3

# Execute
gcloud run jobs execute my-job --region=europe-west1

# READ
gcloud run jobs list --format=json
gcloud run jobs describe my-job --region=europe-west1 --format=json

# ⚠️ DESTRUCTIVE
gcloud run jobs delete my-job --region=europe-west1
```

## Cloud Functions (Gen 2)

```bash
# WRITE — deploy HTTP function
gcloud functions deploy my-func \
  --gen2 \
  --runtime=nodejs20 \
  --region=europe-west1 \
  --trigger-http \
  --entry-point=handler \
  --source=.

# Event-triggered (Pub/Sub)
gcloud functions deploy my-func \
  --gen2 \
  --runtime=python312 \
  --region=europe-west1 \
  --trigger-topic=my-topic

# ⚠️ SECURITY — exposes to public internet
gcloud functions deploy my-func --allow-unauthenticated ...

# READ
gcloud functions list --format=json
gcloud functions describe my-func --region=europe-west1 --format=json
gcloud functions logs read my-func --region=europe-west1

# ⚠️ DESTRUCTIVE
gcloud functions delete my-func --region=europe-west1
```

## App Engine

```bash
gcloud app deploy app.yaml
gcloud app browse
gcloud app logs tail
gcloud app versions list --format=json

# ⚠️ DESTRUCTIVE
gcloud app versions delete VERSION_ID

# Traffic splitting
gcloud app services set-traffic SERVICE --splits v1=50,v2=50
```

## Cloud Scheduler

```bash
# WRITE — create cron job
gcloud scheduler jobs create http my-job \
  --schedule="0 9 * * 1" \
  --uri="https://my-service.run.app/task" \
  --http-method=POST \
  --location=europe-west1 \
  --oidc-service-account-email=SA_EMAIL

# Pub/Sub trigger
gcloud scheduler jobs create pubsub my-job \
  --schedule="*/5 * * * *" \
  --topic=my-topic \
  --message-body='{"action":"process"}' \
  --location=europe-west1

# READ
gcloud scheduler jobs list --location=europe-west1 --format=json

# Manual trigger
gcloud scheduler jobs run my-job --location=europe-west1

# ⚠️ DESTRUCTIVE
gcloud scheduler jobs delete my-job --location=europe-west1
```

## Cloud Tasks

```bash
# WRITE — create queue
gcloud tasks queues create my-queue --location=europe-west1

# Create HTTP task
gcloud tasks create-http-task \
  --queue=my-queue \
  --url="https://my-service.run.app/process" \
  --http-method=POST \
  --location=europe-west1

# READ
gcloud tasks queues list --location=europe-west1 --format=json

# ⚠️ DESTRUCTIVE
gcloud tasks queues delete my-queue --location=europe-west1
```

## GKE (Kubernetes Engine)

```bash
# ⚠️ EXPENSIVE — ~$70+/month for 3-node e2-medium cluster
gcloud container clusters create my-cluster \
  --zone=europe-west1-b \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --enable-autoscaling --min-nodes=1 --max-nodes=5

# Get kubectl credentials
gcloud container clusters get-credentials my-cluster --zone=europe-west1-b

# READ
gcloud container clusters list --format=json

# WRITE — resize
gcloud container clusters resize my-cluster --num-nodes=5 --zone=europe-west1-b

# ⚠️ DESTRUCTIVE
gcloud container clusters delete my-cluster --zone=europe-west1-b
```
