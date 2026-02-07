# Dockerfile para Backend (PHP 8.x + Apache)
FROM php:8.2-apache

# Instalar extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite headers

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar código del backend
COPY backend/ /var/www/html/

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configuración de Apache
COPY docker/backend/apache-config.conf /etc/apache2/sites-available/000-default.conf

# Configurar PHP para UTF-8
RUN echo "default_charset = \"UTF-8\"" >> /usr/local/etc/php/conf.d/charset.ini

EXPOSE 80

CMD ["apache2-foreground"]
