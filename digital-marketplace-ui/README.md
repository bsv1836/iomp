# 🛒 Digital Marketplace with Real-Time Bidding — Frontend

> React + Vite frontend for the Digital Marketplace with real-time bidding via WebSocket.
>
> **CVR College of Engineering** — Industrial Oriented Mini Project (IOMP)
> Department of CSE | B.Tech CSE-G | III Year II Semester
> Guide: Ms. S. Satya Sudha, Asst. Professor

---

## 👥 Team

| Member | Roll No | Contribution |
|--------|---------|--------------|
| S. Hasini Reddy | 23B81A05CM | User Module — Registration, Login |
| P. Bhanu Prasad | 23B81A05CD | Product Module — Listings |
| B. Shanmukha Vas | 23B81A05DN | Full Frontend — All Pages, WebSocket Integration |

---

## 📌 About

A professional dark-themed React frontend for the Digital Marketplace. Features real-time bid updates, two-section product listing (Auctions + Direct Sale), image upload, and a two-step sell form.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Page navigation |
| Axios | REST API calls |
| @stomp/stompjs | WebSocket STOMP client |
| sockjs-client | WebSocket fallback |

---

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Split-layout login with tagline |
| Register | `/register` | Registration — no role selection needed |
| Products | `/products` | Two sections: Live Auctions + Buy Now |
| Product Detail | `/products/:id` | Full details, bidding, live updates, winner banner |
| Sell | `/sell` | 2-step form with image upload and product history |
| My Bids | `/my-bids` | All bids placed by logged-in user |

---

## 🎨 Design

- **Theme:** Professional dark (background `#0a0a15`, cards `#12121f`)
- **Accent:** Red `#e94560` for auctions, Teal `#00b09b` for direct sale
- **Layout:** Sticky navbar, responsive grid, split auth pages

---

## 🔌 WebSocket Integration

Connects to `ws://localhost:8080/ws` using SockJS + STOMP.

Subscribes to `/topic/bids/{productId}` on the Product Detail page.

Handles two message types:
- `NEW_BID` → updates current price and live feed instantly
- `AUCTION_CLOSED` → shows winner banner to everyone on the page

---

## 📁 Project Structure

```
src/
├── api/
│   └── axios.js          ← API base URL + JWT interceptor
├── components/
│   └── Navbar.jsx        ← Sticky navbar with Sell button
└── pages/
    ├── Login.jsx          ← Split layout login
    ├── Register.jsx       ← Split layout register
    ├── Products.jsx       ← Two sections grid
    ├── ProductDetail.jsx  ← Full detail + live bidding
    ├── Sell.jsx           ← 2-step sell form + image upload
    └── MyBids.jsx         ← Bid history
```

---

## ▶️ How to Run Locally

> ⚠️ Make sure the backend is running at `http://localhost:8080` first.

**1. Clone and switch to frontend branch**
```bash
git clone https://github.com/bsv1836/iomp.git
cd iomp
git checkout frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Start development server**
```bash
npm run dev
```

**4. Open in browser**
```
http://localhost:5173
```

---

## 🔗 Backend Dependency

This frontend requires the backend running at `http://localhost:8080`.
See the `master` branch for backend setup:
```
https://github.com/bsv1836/iomp/tree/master
```

---

## 🧪 How to Test

1. Register at `/register`
2. Login at `/login`
3. List a product at `/sell` with image upload
4. Browse products at `/products`
5. Open same auction in two browser windows
6. Place a bid — watch both windows update in real time!
7. Check your bids at `/my-bids`

---

## 🔮 Future Scope

- [ ] Vercel deployment
- [ ] Search and filter products
- [ ] Seller profile page
- [ ] Mobile responsive layout

---

## 📄 License

Built for academic purposes at CVR College of Engineering.
