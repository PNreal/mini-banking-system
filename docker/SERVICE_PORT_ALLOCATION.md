# **SERVICE PORT ALLOCATION TABLE**

**Last Updated:** 2025-12-03  
**Purpose:** Quick reference for port allocation to avoid conflicts

---

## **APPLICATION PORTS**

| Service | Port | Status | Assigned To | Notes |
|---------|------|--------|-------------|-------|
| API Gateway | `8080` | Reserved | - | Main entry point |
| User Service | `8081` | Reserved | - | - |
| Account Service | `8082` | Reserved | - | - |
| Transaction Service | `8083` | In Use | Transaction Service | Currently active |
| Notification Service | `8084` | Reserved | - | - |
| Log Service | `8085` | In Use | Log Service | Currently active |
| Admin Service | `8086` | Reserved | - | - |
| - | `8087` | Available | - | For future use |
| - | `8088` | Available | - | For future use |
| - | `8089` | Available | - | For future use |

---

## **POSTGRESQL PORTS**

| Service | Database | External Port | Status | Assigned To | Notes |
|---------|----------|--------------|--------|-------------|-------|
| Log Service | `log_db` | `5433` | In Use | Log Service | Currently active |
| User Service | `user_db` | `5434` | Reserved | - | - |
| Account Service | `account_db` | `5435` | Reserved | - | - |
| Transaction Service | `transaction_db` | `5436` | In Use | Transaction Service | Currently active |
| Notification Service | `notif_db` | `5437` | Reserved | - | - |
| Admin Service | `admin_db` | `5438` | Reserved | - | - |
| - | - | `5439` | Available | - | For future use |

**IMPORTANT:** Port `5432` is PostgreSQL default port, DO NOT use as external port!

---

## **SHARED SERVICES PORTS**

| Service | Port | Status | Notes |
|---------|------|--------|-------|
| Kafka (External) | `9092` | In Use | Shared by all services |
| Kafka (Internal) | `29092` | In Use | Docker network only |
| Zookeeper | `2181` | In Use | Required by Kafka |

**IMPORTANT:** Kafka and Zookeeper are SHARED services. Only ONE instance exists!

---

## **HOW TO USE THIS TABLE**

### **When adding a new service:**

1. Check available ports in this table
2. Choose an available port
3. Update this table with:
   - Service name
   - Port number
   - Status: "In Use"
   - Assigned To: Your name/service
4. Update `docker-compose.yml`
5. Update `application.properties`
6. Commit changes with message: `feat: add {service-name} docker configuration`

### **When checking for conflicts:**

1. Search this table for the port you want to use
2. If status is "In Use" or "Reserved", choose another port
3. If status is "Available", you can use it

---

## **LEGEND**

- **In Use:** Currently active and running
- **Reserved:** Assigned but not yet implemented
- **Available:** Free to use

---

## **QUICK COMMANDS**

### **Check if port is in use:**
```bash
# Windows
netstat -ano | findstr "8085"

# Linux/Mac
lsof -i :8085
```

### **Check Docker containers:**
```bash
docker-compose ps
```

### **Check port mappings:**
```bash
docker port postgres-log-service
```

---

**Remember:** Always check this table before assigning a new port!

