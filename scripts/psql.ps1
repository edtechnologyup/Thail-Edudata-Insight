# เชื่อม psql ไปยัง PostgreSQL ใน Docker (docker-compose)
# ใช้: .\scripts\psql.ps1
# หรือส่งคำสั่ง SQL: .\scripts\psql.ps1 -c "SELECT 1"

param(
    [string]$Command = ""
)

$container = "thail-datacatalog-postgres-1"

if ($Command) {
    docker exec $container psql -U postgres -d datacatalog -c $Command
} else {
    docker exec -it $container psql -U postgres -d datacatalog
}
