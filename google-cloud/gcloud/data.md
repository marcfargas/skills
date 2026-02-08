# Data: Cloud SQL, BigQuery, Pub/Sub

## Cloud SQL

```bash
# ⚠️ EXPENSIVE — always-on, ~$8-400+/mo depending on tier
gcloud sql instances create my-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-west1

# Create database
gcloud sql databases create mydb --instance=my-db
gcloud sql databases list --instance=my-db --format=json

# Create user — NEVER put password in CLI args
# Use --prompt-for-password or pull from Secret Manager
gcloud sql users create myuser --instance=my-db --prompt-for-password

# Or from Secret Manager
gcloud sql users set-password myuser --instance=my-db \
  --password="$(gcloud secrets versions access latest --secret=db-password)"

# Connect directly
gcloud sql connect my-db --user=myuser

# Cloud SQL Auth Proxy (for local dev — preferred)
cloud-sql-proxy PROJECT_ID:europe-west1:my-db

# Export/Import
gcloud sql export sql my-db gs://my-bucket/backup.sql --database=mydb
gcloud sql import sql my-db gs://my-bucket/backup.sql --database=mydb  # ⚠️ overwrites

# READ
gcloud sql instances list --format=json
gcloud sql instances describe my-db --format=json

# ⚠️ DESTRUCTIVE
gcloud sql instances delete my-db
```

---

## BigQuery (bq)

### Datasets & Tables

```bash
# Create dataset
bq mk my_dataset
bq ls --format=json

# Create table with schema
bq mk --table my_dataset.my_table schema.json

# READ
bq show --format=json my_dataset.my_table
bq head my_dataset.my_table
```

### Queries

```bash
# Query (always use Standard SQL)
bq query --use_legacy_sql=false --format=json \
  'SELECT * FROM `project.dataset.table` LIMIT 10'

# Dry run (estimate bytes scanned — cost check)
bq query --use_legacy_sql=false --dry_run \
  'SELECT * FROM `project.dataset.table`'
```

### Load & Export

```bash
# Load from GCS
bq load --source_format=CSV my_dataset.my_table gs://bucket/data.csv schema.json
bq load --autodetect --source_format=NEWLINE_DELIMITED_JSON \
  my_dataset.my_table gs://bucket/data.jsonl

# Export to GCS
bq extract --destination_format=CSV my_dataset.my_table gs://bucket/export.csv
```

### Delete

```bash
# ⚠️ DESTRUCTIVE — drops table
bq rm my_dataset.my_table

# ⚠️ DESTRUCTIVE — drops dataset and ALL tables
bq rm -r my_dataset
```

---

## Pub/Sub

```bash
# Topics
gcloud pubsub topics create my-topic
gcloud pubsub topics list --format=json

# Subscriptions
gcloud pubsub subscriptions create my-sub --topic=my-topic
gcloud pubsub subscriptions list --format=json

# Publish
gcloud pubsub topics publish my-topic --message="Hello"
gcloud pubsub topics publish my-topic --message='{"key":"value"}' \
  --attribute="type=event"

# Pull
gcloud pubsub subscriptions pull my-sub --auto-ack --limit=10 --format=json

# ⚠️ DESTRUCTIVE
gcloud pubsub topics delete my-topic
gcloud pubsub subscriptions delete my-sub
```
