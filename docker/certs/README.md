Coloca aqui los certificados TLS que consumira docker/nginx/edge.conf.

Archivos requeridos:

- fullchain.pem
- privkey.pem

Puedes generarlos autofirmados o copiarlos desde Let's Encrypt.

Autofirmado (solo pruebas):
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
 -keyout privkey.pem \
 -out fullchain.pem \
 -subj "/C=ES/ST=Alicante/L=Benidorm/O=MetricGate/CN=www.metricgate.es" \
 -addext "subjectAltName=DNS:www.metricgate.es,DNS:metricgate.es"
