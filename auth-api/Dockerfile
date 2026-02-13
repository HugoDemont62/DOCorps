FROM php:8.1-apache

# Métadonnées
LABEL maintainer="DevOpsCorp Team"
LABEL description="Auth API - Service d'authentification PHP"

# Installation des extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration Apache
RUN a2enmod rewrite

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers de l'application
COPY . /var/www/html/

# Installer les dépendances
RUN composer install --no-dev --optimize-autoloader

# Créer le dossier database et donner les permissions
RUN mkdir -p database && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod -R 777 database

# Configuration Apache pour pointer vers public/
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Copier la configuration .env
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Exposer le port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Démarrer Apache
CMD ["apache2-foreground"]
