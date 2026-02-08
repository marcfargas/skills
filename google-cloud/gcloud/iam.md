# IAM, Projects & Secrets

## Projects

```bash
gcloud projects list --format=json
gcloud projects create PROJECT_ID --name="Display Name"
gcloud config set project PROJECT_ID
gcloud config get-value project
gcloud projects describe PROJECT_ID --format=json

# Link billing (required for resource creation)
gcloud billing accounts list
gcloud billing projects link PROJECT_ID --billing-account=ACCOUNT_ID
```

## APIs

Most APIs are disabled by default. Enable before first use:

```bash
# Enable single API
gcloud services enable compute.googleapis.com

# Enable multiple at once
gcloud services enable \
  compute.googleapis.com \
  container.googleapis.com \
  run.googleapis.com \
  cloudsql.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# List enabled APIs
gcloud services list --format=json

# Check if specific API is enabled
gcloud services list --filter="name:run.googleapis.com" --format="value(name)"
```

## IAM Roles

```bash
# View project IAM policy
gcloud projects get-iam-policy PROJECT_ID --format=json

# Grant role (WRITE — confirm with user)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:user@example.com" \
  --role="roles/compute.instanceAdmin.v1"

# Check what roles a user has
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user@example.com" \
  --format="table(bindings.role)"

# ⚠️ DESTRUCTIVE — remove role
gcloud projects remove-iam-policy-binding PROJECT_ID \
  --member="user:user@example.com" \
  --role="roles/compute.instanceAdmin.v1"
```

> **Least privilege**: Use specific roles (`roles/compute.instanceAdmin.v1`),
> never `roles/owner` or `roles/editor` for automation.

## Service Accounts

```bash
# Create
gcloud iam service-accounts create SA_NAME --display-name="Description"

# List
gcloud iam service-accounts list --format=json

# Grant role to service account
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/run.admin"

# Check service account permissions
gcloud iam service-accounts get-iam-policy SA_EMAIL --format=json
```

> ⚠️ **FORBIDDEN**: Do not use `gcloud iam service-accounts keys create`.
> Use impersonation instead (see [auth.md](auth.md)).
> If keys are absolutely required (user explicitly confirmed), they must be
> stored in Secret Manager, rotated within 90 days, and deleted when unused.

## Secret Manager

```bash
# Create secret (pipe from stdin — no plaintext in CLI args)
echo -n "s3cr3t" | gcloud secrets create my-secret --data-file=-

# Access latest version
gcloud secrets versions access latest --secret=my-secret

# Add new version
echo -n "new-value" | gcloud secrets versions add my-secret --data-file=-

# List & describe
gcloud secrets list --format=json
gcloud secrets describe my-secret --format=json

# Grant access to service account
gcloud secrets add-iam-policy-binding my-secret \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# ⚠️ DESTRUCTIVE — delete secret
gcloud secrets delete my-secret
```

## Workload Identity Federation

Keyless auth for external systems (GitHub Actions, AWS, Azure):

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"

# Create provider (GitHub example)
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"

# Allow SA impersonation from GitHub
gcloud iam service-accounts add-iam-policy-binding SA_EMAIL \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUM/locations/global/workloadIdentityPools/github-pool/attribute.repository/ORG/REPO"
```
