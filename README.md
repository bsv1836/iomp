# 🛒 Digital Marketplace with Real-Time Bidding

> A secure, automated, and real-time digital auction system built with Java Spring Boot.
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
| B. Shanmukha Vas | 23B81A05DN | Bid Module — Real-Time Bidding, WebSocket, Scheduler |

---

## 📌 About the Project

The Digital Marketplace with Real-Time Bidding is a Java-based online auction system inspired by modern e-commerce platforms. It enables users to:

- Register and login securely with JWT authentication
- List products for **auction** (with bid increments and time limits) or **direct sale**
- Place bids in real time with live updates via WebSocket
- Automatically close auctions after time expiry and announce winners
- Buy direct sale products instantly

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
| Testing | Postman |

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
├── name
├── description
├── starting_price
├── current_price
├── bid_increment
├── auction_end_time
├── sale_type (AUCTION / DIRECT)
├── status (ACTIVE / SOLD / EXPIRED)
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
| GET | `/api/products/{id}` | Public | Get single product details |
| GET | `/api/products/my` | JWT | Get my listed products |
| POST | `/api/products/{id}/buy` | JWT | Buy a direct sale product |

### 💰 Bid APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bids/{productId}` | JWT | Place a bid |
| GET | `/api/bids/{productId}/highest` | Public | Get current highest bid |
| GET | `/api/bids/{productId}/history` | JWT (seller only) | Get full bid history |
| GET | `/api/bids/my-bids` | JWT | Get all my bids |

### 🔌 WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8080/ws` | WebSocket connection URL (SockJS) |
| `/topic/bids/{productId}` | Subscribe for live bid updates |

**Message Types:**
- `NEW_BID` — broadcast when a new bid is placed
- `AUCTION_CLOSED` — broadcast when auction ends with winner details

---

## ✅ Bid Validation Rules

1. Product must exist
2. Must be an AUCTION type product (not DIRECT)
3. Auction status must be `ACTIVE`
4. Auction end time must not have passed
5. Bidder must NOT be the seller
6. Bid amount must be ≥ `currentPrice + bidIncrement`

---

## ⏰ Auction Scheduler

- Runs automatically every **60 seconds**
- Finds all `ACTIVE` auctions where `auctionEndTime` has passed
- If bids exist → marks product as `SOLD`, announces winner via WebSocket
- If no bids → marks product as `EXPIRED`
- Winner announcement is broadcast to **everyone** viewing the auction page

---

## ▶️ How to Run

### Prerequisites
- Java 17
- MySQL 8.x
- Maven

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/digital-marketplace.git
cd digital-marketplace
```

**2. Create the database**
```sql
CREATE DATABASE IF NOT EXISTS digital_marketplace;
```

**3. Update `application.properties`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/digital_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

**4. Run the application**
```bash
./mvnw clean spring-boot:run
```

**5. Server starts at**
```
http://localhost:8080
```

---

## 🧪 Sample API Usage (Postman)

### Register
```json
POST /api/users/register
{
    "name": "John Doe",
    "email": "john@gmail.com",
    "password": "123456",
    "role": "SELLER"
}
```

### Login
```json
POST /api/users/login
{
    "email": "john@gmail.com",
    "password": "123456"
}
// Response: { "token": "eyJhbGci..." }
```

### Place a Bid
```json
POST /api/bids/1
Authorization: Bearer eyJhbGci...
{
    "bidAmount": 51000
}
```

---

## 📁 Project Structure

```
src/main/java/com/marketplace/digital_marketplace/
├── config/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthFilter.java
│   ├── JwtUtil.java
│   ├── SecurityConfig.java
│   └── WebSocketConfig.java
├── controller/
│   ├── BidController.java
│   ├── ProductController.java
│   └── UserController.java
├── dto/
│   ├── BidMessage.java
│   ├── BidRequest.java
│   ├── BidResponse.java
│   ├── BuyResponse.java
│   ├── LoginRequestDTO.java
│   ├── ProductRequest.java
│   ├── ProductResponse.java
│   └── RegisterRequestDTO.java
├── entity/
│   ├── Bid.java
│   ├── Product.java
│   └── User.java
├── repository/
│   ├── BidRepository.java
│   ├── ProductRepository.java
│   └── UserRepository.java
└── service/
    ├── AuctionScheduler.java
    ├── BidService.java
    ├── ProductService.java
    └── UserService.java
```

---

## 🔮 Future Scope

- [ ] Frontend UI (HTML + CSS + JavaScript)
- [ ] Email notifications for winners
- [ ] Payment gateway integration
- [ ] Product image uploads
- [ ] Admin dashboard

---

## 📄 License

This project is built for academic purposes at CVR College of Engineering.
