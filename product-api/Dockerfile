# Image de base : Python 3.11 en version "slim" (légère, ~150 Mo au lieu de ~900 Mo)
FROM python:3.11-slim

# Définit le dossier de travail DANS le conteneur
# Toutes les commandes suivantes s'exécutent depuis /app
WORKDIR /app

# Copie SEULEMENT requirements.txt d'abord
# Pourquoi ? Docker met en cache chaque étape (layer).
# Si le code change mais pas les dépendances, Docker ne réinstalle pas les packages.
# Ça accélère énormément les rebuilds.
COPY requirements.txt .

# Installe les dépendances Python
# --no-cache-dir : ne garde pas le cache pip (réduit la taille de l'image)
RUN pip install --no-cache-dir -r requirements.txt

# Maintenant, copie tout le reste du code
COPY . .

# Expose le port 5000 (documentation, ne fait rien techniquement)
EXPOSE 5000

# Commande lancée quand le conteneur démarre
# --host 0.0.0.0 : écoute sur toutes les interfaces (nécessaire dans Docker)
# Sans ça, uvicorn n'écoute que sur localhost et le port n'est pas accessible
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
