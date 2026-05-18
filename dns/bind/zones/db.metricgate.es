$TTL 300
@   IN SOA ns1.metricgate.es. admin.metricgate.es. (
        2026051801 ; serial
        3600       ; refresh
        900        ; retry
        1209600    ; expire
        300        ; minimum
)

@       IN NS  ns1.metricgate.es.

; Cambia 192.168.1.50 por la IP LAN de la maquina donde corre edge-nginx.
ns1     IN A   192.168.1.50
@       IN A   192.168.1.50
www     IN A   192.168.1.50
