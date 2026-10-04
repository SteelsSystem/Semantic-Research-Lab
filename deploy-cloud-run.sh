#!/bin/bash
set -e

# ==============================================================================
# Nasazení Multimodálního kognitivního rozhraní na Google Cloud Run
# ==============================================================================

SERVICE_NAME="multimodal-cognitive"
REGION="europe-west1"

echo "=== Kontrola přihlášení a projektu Google Cloud ==="
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo "Chyba: Nebyl nastaven žádný aktivní Google Cloud projekt."
  echo "Spusťte: gcloud config set project <ID_VÁŠEHO_PROJEKTU>"
  exit 1
fi

echo "Projekt: $PROJECT_ID | Region: $REGION | Služba: $SERVICE_NAME"

# Ověření GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Upozornění: Proměnná prostředí GEMINI_API_KEY není nastavena v lokálním shellu."
  read -p "Zadejte svůj Google Gemini API klíč: " GEMINI_API_KEY
fi

echo "=== Povolení požadovaných Google Cloud služeb (Cloud Run & Cloud Build) ==="
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID"

echo "=== Sestavení a nasazení kontejneru na Google Cloud Run ==="
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,NODE_ENV=production" \
  --timeout 3600 \
  --concurrency 80 \
  --cpu 2 \
  --memory 2Gi \
  --project "$PROJECT_ID"

echo "=== Nasazení na Google Cloud Run bylo úspěšně dokončeno! ==="
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
