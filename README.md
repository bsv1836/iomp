# 🛒 Digital Marketplace with Real-Time Bidding — Backend

> Java Spring Boot REST API with WebSocket support for real-time bidding.
>
> **CVR College of Engineering** — Industrial Oriented Mini Project (IOMP)
> Department of CSE | B.Tech CSE-G | III Year II Semester
> Guide: Ms. S. Satya Sudha, Asst. Professor

---

## 👥 Team

| Member | Roll No | Contribution |
|--------|---------|--------------|
| S. Hasini Reddy | 23B81A05CM | User Module — Registration, Login, JWT Setup |
| P. Bhanu Prasad | 23B81A05CD | Product Module — Listings, JWT Security |
| B. Shanmukha Vas | 23B81A05DN | Bid Module — Real-Time Bidding, WebSocket, Scheduler, Image Upload |

---

## 📌 About

A secure, automated, and real-time digital auction system. Users can register, login, list products for auction or direct sale, place bids with live updates, and buy products instantly.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Database | MySQL 8.x |
| ORM | Spring Data JPA + Hibernate |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Real-Time | Spring WebSocket + STOMP + SockJS |
| Build Tool | Maven |

---

## 🗄️ Database Schema

```
users
├── id (PK)
├── name
├── email (unique)
├── password (BCrypt)
└── role

products
├── product_id (PK)
├── seller_id (FK → users)
├── name, description
├── starting_price, current_price, bid_increment
├── auction_end_time
├── sale_type (AUCTION / DIRECT)
├── status (ACTIVE / SOLD / EXPIRED)
├── category, brand, product_condition
├── damages, location
├── purchase_month, purchase_year
├── warranty_remaining, image_path
└── created_at

bids
├── bid_id (PK)
├── product_id (FK → products)
├── bidder_id (FK → users)
├── bid_amount
└── timestamp
```

---

## 🌐 API Reference

### 👤 User APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Login and get JWT token |

### 📦 Product APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/products` | JWT | List a new product |
| GET | `/api/products` | Public | Get all active products |
| GET | `/api/products/{id}` | Public | Get single product |
| GET | `/api/products/my` | JWT | Get my listed products |
| POST | `/api/products/{id}/buy` | JWT | Buy a direct sale product |

### 💰 Bid APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bids/{productId}` | JWT | Place a bid |
| GET | `/api/bids/{productId}/highest` | Public | Get highest bid |
| GET | `/api/bids/{productId}/history` | JWT (seller only) | Full bid history |
| GET | `/api/bids/my-bids` | JWT | My bids |

### 🖼️ Image APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/images/upload/{productId}` | JWT | Upload product image |
| GET | `/uploads/{filename}` | Public | Serve uploaded image |

### 🔌 WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8080/ws` | WebSocket connection (SockJS) |
| `/topic/bids/{productId}` | Subscribe for live bid updates |

**Message Types received on `/topic/bids/{productId}`:**
- `NEW_BID` — someone placed a bid (includes bidder name + amount)
- `AUCTION_CLOSED` — auction ended (includes winner name + winning amount)

---

## ✅ Bid Validation Rules

1. Product must exist
2. Must be AUCTION type (not DIRECT)
3. Status must be ACTIVE
4. Auction end time must not have passed
5. Bidder must NOT be the seller
6. Bid amount must be ≥ `currentPrice + bidIncrement`

---

## ⏰ Auction Scheduler

- Runs every **60 seconds** automatically
- Finds ACTIVE auctions where `auctionEndTime` has passed
- If bids exist → marks SOLD, broadcasts winner to all viewers via WebSocket
- If no bids → marks EXPIRED

---

## 📁 Project Structure

```
src/main/java/com/marketplace/digital_marketplace/
├── config/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthFilter.java
│   ├── JwtUtil.java
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   └── WebSocketConfig.java
├── controller/
│   ├── BidController.java
│   ├── ImageController.java
│   ├── ProductController.java
│   └── UserController.java
├── dto/
│   ├── BidMessage.java, BidRequest.java, BidResponse.java
│   ├── BuyResponse.java, LoginRequestDTO.java
│   ├── ProductRequest.java, ProductResponse.java
│   └── RegisterRequestDTO.java
├── entity/
│   ├── Bid.java, Product.java, User.java
├── repository/
│   ├── BidRepository.java, ProductRepository.java, UserRepository.java
└── service/
    ├── AuctionScheduler.java, BidService.java
    ├── ProductService.java, UserService.java
```

---

## ▶️ How to Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/bsv1836/iomp.git
cd iomp
```

**2. Create the database**
```sql
CREATE DATABASE IF NOT EXISTS digital_marketplace;
```

**3. Update `src/main/resources/application.properties`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/digital_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

**4. Run**
```bash
./mvnw clean spring-boot:run
```

Server starts at `http://localhost:8080`

---

## 🔮 Future Scope

- [ ] Cloudinary integration for cloud image storage
- [ ] Email notifications for winners
- [ ] Payment gateway integration
- [ ] Admin dashboard

---

## 📄 License

Built for academic purposes at CVR College of Engineering.
