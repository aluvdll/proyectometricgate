FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    unzip \
    zip \
    && docker-php-ext-install \
    bcmath \
    intl \
    pdo_mysql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backendApi

COPY backendApi/composer.json backendApi/composer.lock* ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

COPY backendApi/ ./

RUN chown -R www-data:www-data storage bootstrap/cache

CMD ["php-fpm"]
