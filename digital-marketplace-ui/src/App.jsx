import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Sell from './pages/Sell'
import MyBids from './pages/MyBids'
import Profile from './pages/Profile'
import OAuth2Callback from './pages/OAuth2Callback'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/products" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/my-bids" element={<MyBids />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App