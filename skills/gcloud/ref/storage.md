# Cloud Storage & Artifact Registry

## Cloud Storage

> **Note**: `gsutil` is being replaced by `gcloud storage`. Both work today.
> New scripts should prefer `gcloud storage`. Examples show both where relevant.

### Buckets

```bash
# Create
gcloud storage buckets create gs://my-bucket --location=europe-west1

# List
gcloud storage ls
gcloud storage buckets list --format=json

# ⚠️ DESTRUCTIVE — remove bucket (must be empty, or use --recursive)
gcloud storage rm --recursive gs://my-bucket/
```

### Upload & Download

```bash
# Upload
gcloud storage cp local.txt gs://my-bucket/
gcloud storage cp -r ./dir gs://my-bucket/dir/    # recursive

# Download
gcloud storage cp gs://my-bucket/file.txt ./
gcloud storage cp -r gs://my-bucket/dir/ ./local/  # recursive

# Move/rename
gcloud storage mv gs://my-bucket/old.txt gs://my-bucket/new.txt
```

### Sync

```bash
# Sync local → GCS
gcloud storage rsync ./local-dir gs://my-bucket/remote-dir --recursive

# Sync GCS → local
gcloud storage rsync gs://my-bucket/dir ./local --recursive

# ⚠️ DESTRUCTIVE: --delete-unmatched-destination-objects removes files at
# destination not present in source. Always confirm with user.
gcloud storage rsync ./local gs://my-bucket/dir --recursive --delete-unmatched-destination-objects
```

### List & Info

```bash
gcloud storage ls gs://my-bucket/
gcloud storage ls -l gs://my-bucket/            # sizes
gcloud storage du -s gs://my-bucket              # total size
gcloud storage cat gs://my-bucket/file.txt       # print contents
```

### Permissions

```bash
# Grant read access
gcloud storage buckets add-iam-policy-binding gs://my-bucket \
  --member="user:user@example.com" \
  --role="roles/storage.objectViewer"

# ⚠️ SECURITY — make public
gcloud storage buckets add-iam-policy-binding gs://my-bucket \
  --member="allUsers" \
  --role="roles/storage.objectViewer"
```

### Delete

```bash
# ⚠️ DESTRUCTIVE — delete objects
gcloud storage rm gs://my-bucket/file.txt
gcloud storage rm -r gs://my-bucket/dir/     # recursive
gcloud storage rm -r gs://my-bucket/         # entire bucket contents + bucket
```

### gsutil equivalents (legacy)

| `gcloud storage` | `gsutil` (legacy) |
|-------------------|-------------------|
| `gcloud storage cp` | `gsutil cp` |
| `gcloud storage ls` | `gsutil ls` |
| `gcloud storage rm` | `gsutil rm` |
| `gcloud storage rsync` | `gsutil rsync` |
| `gcloud storage mv` | `gsutil mv` |
| `gcloud storage cat` | `gsutil cat` |
| `gcloud storage buckets create` | `gsutil mb` |

---

## Artifact Registry

Preferred over Container Registry for Docker images, npm packages, Python packages, etc.

```bash
# Create Docker repository
gcloud artifacts repositories create my-repo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker images"

# Configure Docker auth
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Tag and push
docker tag my-image europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag
docker push europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag

# READ
gcloud artifacts repositories list --format=json
gcloud artifacts docker images list europe-west1-docker.pkg.dev/PROJECT_ID/my-repo --format=json

# ⚠️ DESTRUCTIVE
gcloud artifacts docker images delete europe-west1-docker.pkg.dev/PROJECT_ID/my-repo/my-image:tag
gcloud artifacts repositories delete my-repo --location=europe-west1
```
