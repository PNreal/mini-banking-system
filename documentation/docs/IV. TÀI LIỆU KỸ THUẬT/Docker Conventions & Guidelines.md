# **DOCKER CONVENTIONS & GUIDELINES - MINI BANKING SYSTEM**

**Version:** 1.0  
**Last Updated:** 2025-12-03  
**Mục đích:** Đảm bảo các thành viên trong team sử dụng Docker một cách nhất quán, tránh conflict giữa các services.

---

## **1. TỔNG QUAN** {#tổng-quan}

Dự án Mini Banking System sử dụng kiến trúc **microservices** với mỗi service có database riêng. Tất cả services chia sẻ **Kafka** và **Zookeeper** để giao tiếp bất đồng bộ.

### **1.1. Kiến Trúc Docker** {#kiến-trúc-docker}

```
┌─────────────────────────────────────────────────────────┐
│              Docker Network: banking-network            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Kafka    │  │Zookeeper │  │PostgreSQL│  (Shared)   │
│  │ :9092    │  │ :2181    │  │ Services │             │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ User     │  │ Account  │  │Transaction│  (Services) │
│  │ Service  │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Log      │  │ Admin    │  │Notification│           │
│  │ Service  │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## **2. QUY ƯỚC ĐẶT TÊN (NAMING CONVENTIONS)** {#quy-ước-đặt-tên}

### **2.1. Container Names** {#container-names}

**Format:** `{service-type}-{service-name}`

| Service | Container Name | Ví dụ |
|---------|---------------|-------|
| PostgreSQL | `postgres-{service-name}` | `postgres-log-service` |
| Kafka | `kafka` | `kafka` (duy nhất) |
| Zookeeper | `zookeeper` | `zookeeper` (duy nhất) |

**Lưu ý:**
- **ĐÚNG:** `postgres-user-service`, `postgres-account-service`
- **SAI:** `postgres`, `postgresql`, `db-user`

### **2.2. Volume Names** {#volume-names}

**Format:** `{service-type}-{service-name}-data`

| Service | Volume Name | Ví dụ |
|---------|-------------|-------|
| PostgreSQL | `postgres-{service-name}-data` | `postgres-log-data` |

**Lưu ý:**
- **ĐÚNG:** `postgres-user-data`, `postgres-account-data`
- **SAI:** `postgres-data`, `user-db`, `data`

### **2.3. Network Names** {#network-names}

**Tất cả services phải dùng:** `banking-network`

```yaml
networks:
  - banking-network
```

**Lưu ý:** Không tạo network riêng cho từng service!

---

## **3. PHÂN BỔ PORT (PORT ALLOCATION)** {#phân-bổ-port}

### **3.1. Application Ports** {#application-ports}

Mỗi service phải sử dụng port riêng để tránh conflict:

| Service | Application Port | URL |
|---------|-----------------|-----|
| User Service | `8081` | `http://localhost:8081` |
| Account Service | `8082` | `http://localhost:8082` |
| Transaction Service | `8083` | `http://localhost:8083` |
| Notification Service | `8084` | `http://localhost:8084` |
| Log Service | `8085` | `http://localhost:8085` |
| Admin Service | `8086` | `http://localhost:8086` |
| API Gateway | `8080` | `http://localhost:8080` |

**QUAN TRỌNG:** Trước khi thêm service mới, kiểm tra bảng này và chọn port chưa được sử dụng!

### **3.2. PostgreSQL Ports** {#postgresql-ports}

Mỗi PostgreSQL container phải map port khác nhau:

| Service | Database | External Port | Internal Port | Connection String |
|---------|----------|---------------|---------------|-------------------|
| User Service | `user_db` | `5434` | `5432` | `localhost:5434` |
| Account Service | `account_db` | `5435` | `5432` | `localhost:5435` |
| Transaction Service | `transaction_db` | `5436` | `5432` | `localhost:5436` |
| Notification Service | `notif_db` | `5437` | `5432` | `localhost:5437` |
| Log Service | `log_db` | `5433` | `5432` | `localhost:5433` |
| Admin Service | `admin_db` | `5438` | `5432` | `localhost:5438` |

**Format:** `"5{service-number}3:5432"`

**QUAN TRỌNG:** 
- Port `5432` là port mặc định của PostgreSQL, KHÔNG được dùng làm external port
- Port `5433` đã được dùng cho Log Service
- Ports từ `5434-5439` dành cho các service khác

### **3.3. Shared Services Ports** {#shared-services-ports}

| Service | Port | Mô tả |
|---------|------|-------|
| Kafka | `9092` | External (cho applications) |
| Kafka | `29092` | Internal (cho Docker network) |
| Zookeeper | `2181` | Required by Kafka |

**QUAN TRỌNG:** 
- Kafka và Zookeeper là **SHARED**, chỉ có **1 instance** duy nhất
- Không tạo Kafka/Zookeeper riêng cho từng service!

---

## **4. DATABASE CREDENTIALS** {#database-credentials}

### **4.1. Naming Convention** {#naming-convention}

**Format:** `{service-name}_{type}`

| Type | Format | Ví dụ |
|------|--------|-------|
| Database Name | `{service-name}_db` | `user_db`, `account_db` |
| Username | `{service-name}_user` | `user_user`, `account_user` |
| Password | `{service-name}_password` | `user_password`, `account_password` |

**Lưu ý:**
- **ĐÚNG:** `log_db`, `log_user`, `log_password`
- **SAI:** `logdb`, `logUser`, `log-password`

### **4.2. Bảng Phân Bổ Credentials** {#bảng-phân-bổ-credentials}

| Service | Database | Username | Password |
|---------|----------|----------|----------|
| User Service | `user_db` | `user_user` | `user_password` |
| Account Service | `account_db` | `account_user` | `account_password` |
| Transaction Service | `transaction_db` | `transaction_user` | `transaction_password` |
| Notification Service | `notif_db` | `notif_user` | `notif_password` |
| Log Service | `log_db` | `log_user` | `log_password` |
| Admin Service | `admin_db` | `admin_user` | `admin_password` |

---

## **5. TEMPLATE DOCKER-COMPOSE.YML** {#template-docker-compose}

### **5.1. Template cho Service mới** {#template-cho-service-mới}

Khi thêm service mới, copy template này và điền thông tin:

```yaml
version: '3.8'

services:
  # PostgreSQL Database for {Service Name} Service
  postgres-{service-name}:
    image: postgres:15-alpine
    container_name: postgres-{service-name}-service
    environment:
      POSTGRES_DB: {service-name}_db
      POSTGRES_USER: {service-name}_user
      POSTGRES_PASSWORD: {service-name}_password
    ports:
      - "{port}:5432"  # Thay {port} bằng port đã phân bổ
    volumes:
      - postgres-{service-name}-data:/var/lib/postgresql/data
      - ./docker/init-scripts/{service-name}-init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - banking-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U {service-name}_user -d {service-name}_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Zookeeper for Kafka (CHỈ THÊM NẾU CHƯA CÓ)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - banking-network
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka Broker (CHỈ THÊM NẾU CHƯA CÓ)
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT_INTERNAL
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    networks:
      - banking-network
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-{service-name}-data:

networks:
  banking-network:
    driver: bridge
```

### **5.2. Checklist khi thêm service mới** {#checklist-khi-thêm-service-mới}

- [ ] Chọn port application chưa được sử dụng (8081-8089)
- [ ] Chọn port PostgreSQL chưa được sử dụng (5433-5439)
- [ ] Đặt tên container theo format: `postgres-{service-name}-service`
- [ ] Đặt tên volume theo format: `postgres-{service-name}-data`
- [ ] Sử dụng network: `banking-network`
- [ ] Đặt credentials theo format: `{service-name}_db`, `{service-name}_user`, `{service-name}_password`
- [ ] **KHÔNG** thêm Kafka/Zookeeper nếu đã có trong docker-compose.yml
- [ ] Tạo init script tại: `docker/init-scripts/{service-name}-init.sql`
- [ ] Cập nhật bảng phân bổ port trong tài liệu này

---

## **6. APPLICATION.PROPERTIES CONFIGURATION** {#application-properties-configuration}

### **6.1. Template cho application.properties** {#template-cho-application-properties}

```properties
spring.application.name={service-name}-service

# Server Configuration
server.port={application-port}

# Database Configuration (PostgreSQL Docker)
spring.datasource.url=jdbc:postgresql://localhost:{postgres-port}/{service-name}_db
spring.datasource.username={service-name}_user
spring.datasource.password={service-name}_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Kafka Configuration (SHARED - dùng chung cho tất cả services)
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id={service-name}-service-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
```

### **6.2. Ví dụ cụ thể** {#ví-dụ-cụ-thể}

**User Service:**
```properties
spring.application.name=user-service
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5434/user_db
spring.datasource.username=user_user
spring.datasource.password=user_password
spring.kafka.consumer.group-id=user-service-group
```

**Account Service:**
```properties
spring.application.name=account-service
server.port=8082
spring.datasource.url=jdbc:postgresql://localhost:5435/account_db
spring.datasource.username=account_user
spring.datasource.password=account_password
spring.kafka.consumer.group-id=account-service-group
```

---

## **7. BEST PRACTICES** {#best-practices}

### **7.1. Trước khi thêm service mới** {#trước-khi-thêm-service-mới}

1. **Kiểm tra docker-compose.yml hiện tại** để xem ports đã được sử dụng
2. **Kiểm tra tài liệu này** để xem port allocation
3. **Thông báo team** về port mới bạn sẽ sử dụng
4. **Cập nhật tài liệu** sau khi thêm service

### **7.2. Khi merge code** {#khi-merge-code}

1. **Kiểm tra conflict** trong docker-compose.yml
2. **Đảm bảo** không có duplicate ports
3. **Đảm bảo** Kafka/Zookeeper chỉ có 1 instance
4. **Test** docker-compose up trước khi merge

### **7.3. Khi chạy Docker** {#khi-chạy-docker}

1. **Luôn chạy từ root directory:** `docker-compose up -d`
2. **Kiểm tra ports đang sử dụng:** `netstat -an | findstr "5433\|5434\|5435\|9092"`
3. **Kiểm tra containers:** `docker-compose ps`
4. **Xem logs nếu có lỗi:** `docker-compose logs {service-name}`

---

## **8. TROUBLESHOOTING** {#troubleshooting}

### **8.1. Port Already in Use** {#port-already-in-use}

**Lỗi:**
```
Error: bind: address already in use
```

**Giải pháp:**
1. Kiểm tra port đang được sử dụng:
   ```bash
   # Windows
   netstat -ano | findstr "5433"
   
   # Linux/Mac
   lsof -i :5433
   ```

2. Tìm process đang dùng port:
   ```bash
   # Windows
   tasklist | findstr "{PID}"
   ```

3. Options:
   - **Option 1:** Dừng process đang dùng port
   - **Option 2:** Đổi port trong docker-compose.yml và application.properties

### **8.2. Container Name Already Exists** {#container-name-already-exists}

**Lỗi:**
```
Error: container name "postgres-log-service" is already in use
```

**Giải pháp:**
```bash
# Xóa container cũ
docker rm -f postgres-log-service

# Hoặc đổi tên container trong docker-compose.yml
```

### **8.3. Network Already Exists** {#network-already-exists}

**Lỗi:**
```
Error: network banking-network already exists
```

**Giải pháp:**
- **KHÔNG CẦN LO:** Network có thể được tạo nhiều lần, Docker sẽ tự động reuse
- Nếu muốn tạo mới: `docker network rm banking-network`

### **8.4. Database Connection Failed** {#database-connection-failed}

**Lỗi:**
```
Connection refused: localhost:5433
```

**Giải pháp:**
1. Kiểm tra container đang chạy:
   ```bash
   docker-compose ps postgres-log
   ```

2. Kiểm tra logs:
   ```bash
   docker-compose logs postgres-log
   ```

3. Kiểm tra port mapping:
   ```bash
   docker port postgres-log-service
   ```

4. Đảm bảo application.properties có đúng port

### **8.5. Kafka Connection Failed** {#kafka-connection-failed}

**Lỗi:**
```
Connection to node -1 could not be established
```

**Giải pháp:**
1. Kiểm tra Zookeeper đang chạy:
   ```bash
   docker-compose ps zookeeper
   ```

2. Kiểm tra Kafka đang chạy:
   ```bash
   docker-compose ps kafka
   ```

3. Đảm bảo Kafka depends_on Zookeeper với condition: service_healthy

---

## **9. QUY TRÌNH LÀM VIỆC (WORKFLOW)** {#quy-trình-làm-việc}

### **9.1. Khi bắt đầu làm việc với service mới** {#khi-bắt-đầu-làm-việc-với-service-mới}

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Kiểm tra docker-compose.yml:**
   ```bash
   cat docker-compose.yml | grep -E "ports:|container_name:"
   ```

3. **Chọn port chưa được sử dụng** từ bảng phân bổ

4. **Thêm service vào docker-compose.yml** theo template

5. **Cập nhật application.properties** với port và credentials

6. **Test:**
   ```bash
   docker-compose up -d
   docker-compose ps
   ```

### **9.2. Khi merge code** {#khi-merge-code}

1. **Kiểm tra conflict** trong docker-compose.yml
2. **Đảm bảo** không có duplicate ports/containers
3. **Test** docker-compose up sau khi merge
4. **Cập nhật tài liệu** nếu có thay đổi

---

## **10. TÓM TẮT QUAN TRỌNG** {#tóm-tắt-quan-trọng}

### **PHẢI LÀM:**
- Sử dụng port riêng cho mỗi service
- Đặt tên container/volume theo convention
- Sử dụng network `banking-network`
- Chỉ có 1 Kafka và 1 Zookeeper instance
- Kiểm tra ports trước khi thêm service mới
- Cập nhật tài liệu khi thêm service

### **KHÔNG ĐƯỢC LÀM:**
- Dùng port đã được phân bổ cho service khác
- Tạo Kafka/Zookeeper riêng cho mỗi service
- Đặt tên container/volume tùy ý
- Tạo network riêng cho service
- Merge code mà không kiểm tra conflict

---

## **11. LIÊN HỆ & HỖ TRỢ** {#liên-hệ-hỗ-trợ}

Nếu có thắc mắc hoặc gặp vấn đề:
1. Kiểm tra tài liệu này trước
2. Kiểm tra docker-compose.yml hiện tại
3. Hỏi team trong channel #docker-support
4. Tạo issue trên GitHub với tag `docker`

---

**Chúc bạn code vui vẻ và không bị conflict!**

