# Auth & Configuration

## Authentication

```bash
# Interactive login (opens browser)
gcloud auth login

# Headless / remote
gcloud auth login --no-browser

# Check who's authenticated
gcloud auth list

# Revoke
gcloud auth revoke user@example.com
```

## Service Account Impersonation (Preferred)

**Always prefer impersonation over key files** — short-lived tokens, no key distribution risk.

```bash
# Single command
gcloud compute instances list --impersonate-service-account=SA_EMAIL

# Set as default
gcloud config set auth/impersonate_service_account SA_EMAIL

# Clear
gcloud config unset auth/impersonate_service_account
```

## Application Default Credentials (ADC)

For client libraries (Python, Node.js, Go, etc.):

```bash
# Set up ADC
gcloud auth application-default login

# With impersonation
gcloud auth application-default login --impersonate-service-account=SA_EMAIL

# Revoke
gcloud auth application-default revoke
```

**ADC search order**:
1. `GOOGLE_APPLICATION_CREDENTIALS` env var
2. `~/.config/gcloud/application_default_credentials.json`
3. GCE/GKE metadata server (when running on GCP)

## Service Account (CI/CD only)

```bash
# Activate with key file (CI/CD environments)
gcloud auth activate-service-account --key-file=key.json
```

> ⚠️ **Avoid key files when possible** — use Workload Identity Federation for
> GitHub Actions, or impersonation for development. Key files are static
> credentials that can leak.

## Configuration Profiles

Manage multiple environments without confusion:

```bash
# Create per-environment configs
gcloud config configurations create dev
gcloud config set project my-project-dev
gcloud config set account dev@example.com
gcloud config set compute/region europe-west1
gcloud config set compute/zone europe-west1-b

gcloud config configurations create prod
gcloud config set project my-project-prod
gcloud config set auth/impersonate_service_account prod-sa@project.iam.gserviceaccount.com

# Switch environments
gcloud config configurations activate dev
gcloud config configurations list

# One-off override (doesn't change active config)
gcloud compute instances list --configuration=prod
gcloud compute instances list --project=other-project

# View current settings
gcloud config list
gcloud config get-value project
gcloud config get-value compute/region
```

### Region/Zone Consistency

Related GCP resources **must** be in the same region. Before creating any resource:

```bash
gcloud config get-value compute/region
gcloud config get-value compute/zone
```

Common mismatches that cause failures:
- VM in `europe-west1-b` connecting to Cloud SQL in `us-central1`
- GKE cluster in one zone, persistent disks in another
- Cloud Run in `europe-west1` accessing a VPC in `us-east1`
