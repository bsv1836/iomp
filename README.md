# 🔨 BIDBAZAAR - Modern Digital Marketplace

BidBazaar is a premium, full-stack digital marketplace designed for real-time auctions and direct sales. Featuring a stunning neon-themed UI, secure Google OAuth integration, and instant bidding updates, it provides a state-of-the-art experience for both buyers and sellers.

![BidBazaar Preview](https://res.cloudinary.com/dkeylz0na/image/upload/v1/previews/bidbazaar-banner.png)

---

## 🚀 Features

- **Dynamic Auctions**: Live real-time bidding with instant status updates using WebSockets (STOMP/SockJS).
- **Direct Sales**: Instant "Buy Now" functionality for fixed-price items.
- **Social Trust**: User profiles with custom avatars, transaction history, and verified contact details.
- **Secure Auth**: Seamless Google OAuth 2.0 integration and standard JWT-based authentication.
- **Rich Media**: High-performance image hosting via Cloudinary with automatic server-side transformations.
- **Premium UI**: Dark-mode glassmorphic design with neon accents and ultra-responsive layouts.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security (JWT + OAuth 2.0)
- **Database**: MySQL / Railway DB
- **Real-time**: Spring WebSocket (SockJS + STOMP)
- **Image handling**: Cloudinary API

### Frontend
- **Framework**: React 18+ (Vite)
- **State Management**: React Hooks
- **Communication**: Axios (REST) + StompJS (WebSockets)
- **Styling**: Vanilla CSS with modern Glassmorphism and Neon theme tokens.

---

## ⚙️ Project Structure

```text
digital-marketplace/
├── src/main/java/          # Spring Boot Backend
├── src/main/resources/     # Configuration (application.properties)
└── digital-marketplace-ui/  # React Frontend (Vite)
    ├── src/components/     # Reusable UI Components
    ├── src/pages/          # Individual Page Views
    └── src/api/            # Axios Configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MySQL Instance**

### Backend Setup
1. Clone the repository.
2. Configure your environment variables (see below).
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the UI directory:
   ```bash
   cd digital-marketplace-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables:

| Variable | Description |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | MySQL Connection String |
| `SPRING_DATASOURCE_USERNAME` | Database User |
| `SPRING_DATASOURCE_PASSWORD` | Database Password |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by **Shanmukha Vas, Bhanu Prasad, Hasini**.
