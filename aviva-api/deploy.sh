#!/bin/bash
# deploy.sh — construye la imagen y despliega en Cloud Run
#
# Uso:
#   ./deploy.sh <PROJECT_ID> [REGION]
#
# Ejemplo:
#   ./deploy.sh aviva-hr-prod us-central1
#
# Requisitos previos:
#   1. gcloud CLI instalado y autenticado (gcloud auth login)
#   2. Cloud Run habilitado en el proyecto (gcloud services enable run.googleapis.com)
#   3. Cuenta de servicio creada con rol "Cloud Datastore User" para Firestore
#      gcloud iam service-accounts create aviva-api \
#        --display-name "Aviva HR API"
#      gcloud projects add-iam-policy-binding $PROJECT_ID \
#        --member "serviceAccount:aviva-api@$PROJECT_ID.iam.gserviceaccount.com" \
#        --role "roles/datastore.user"

set -e

PROJECT_ID=${1:?"Uso: ./deploy.sh <PROJECT_ID> [REGION]"}
REGION=${2:-us-central1}
SERVICE="aviva-api"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

echo "→ Proyecto:  $PROJECT_ID"
echo "→ Región:    $REGION"
echo "→ Imagen:    $IMAGE"
echo ""

# Build y push con Cloud Build (no necesita Docker local en CI)
echo "▶ Construyendo imagen..."
gcloud builds submit --tag "$IMAGE" . --project "$PROJECT_ID"

# Deploy
echo "▶ Desplegando en Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_PROJECT_ID=$PROJECT_ID" \
  --service-account "aviva-api@$PROJECT_ID.iam.gserviceaccount.com" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 256Mi \
  --cpu 1 \
  --project "$PROJECT_ID"

echo ""
echo "✓ Deploy completado."
echo "  URL: $(gcloud run services describe $SERVICE --region $REGION --project $PROJECT_ID --format 'value(status.url)')/health"
