# DNS local LAN (Bind9)

Este directorio contiene la configuracion DNS local para resolver:

- metricgate.es
- www.metricgate.es

## Archivos

- bind/named.conf
- bind/named.conf.options
- bind/named.conf.local
- bind/zones/db.metricgate.es

## Pasos rapidos

1. Edita `bind/zones/db.metricgate.es` y cambia `192.168.1.50` por la IP LAN real del servidor.
2. Si tu LAN no es `192.168.1.0/24`, ajusta `allow-recursion` en `bind/named.conf.options`.
3. Levanta el servicio DNS:

```bash
docker compose --profile lan-dns up -d dns
```

4. Configura los clientes (o DHCP en router) para usar como DNS la IP LAN del servidor.

## Verificacion

```bash
nslookup metricgate.es <IP_DNS_LAN>
nslookup www.metricgate.es <IP_DNS_LAN>
```
