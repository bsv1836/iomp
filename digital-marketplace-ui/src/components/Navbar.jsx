import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import API from '../api/axios'
import './Navbar.css'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [showBell, setShowBell] = useState(false)
    const bellRef = useRef(null)

    useEffect(() => {
        if (token) fetchNotifications()
    }, [token, location.pathname])

    useEffect(() => {
        const syncUserName = () => setUserName(localStorage.getItem('userName') || '')
        window.addEventListener('storage', syncUserName)
        // Also sync on route changes (same-tab updates)
        syncUserName()
        return () => window.removeEventListener('storage', syncUserName)
    }, [location.pathname])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setShowBell(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/api/users/notifications')
            setNotifications(res.data)
            setUnreadCount(res.data.filter(n => !n.read).length)
        } catch (err) {
            console.error(err)
        }
    }

    const handleBellClick = async () => {
        setShowBell(!showBell)
        if (!showBell && unreadCount > 0) {
            try {
                await API.put('/api/users/notifications/read')
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar-container">
            <div className="navbar-left">
                <Link to="/products" className="navbar-brand">
                    BidBazaar
                </Link>
                <Link to="/products" className={`navbar-link ${isActive('/products') ? 'active' : ''}`}>
                    Browse
                </Link>
            </div>

            <div className="navbar-right">
                {token ? (
                    <>
                        {/* Bell */}
                        <div className="bell-wrapper" ref={bellRef}>
                            <button className="bell-button" onClick={handleBellClick}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="bell-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showBell && (
                                <div className="notif-dropdown">
                                    <p className="dropdown-title">Notifications</p>
                                    {notifications.length === 0 ? (
                                        <p className="empty-note">No notifications yet</p>
                                    ) : (
                                        notifications.slice(0, 5).map(n => (
                                            <div
                                                key={n.id}
                                                className={`notif-item ${!n.read ? 'unread' : ''}`}
                                                onClick={() => {
                                                    setShowBell(false)
                                                    if (n.productId) navigate(`/products/${n.productId}`)
                                                }}
                                            >
                                                <p className="notif-text">{n.message}</p>
                                                <p className="notif-time">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <Link to="/profile" className="profile-link">
                            <div className="avatar">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{userName}</span>
                        </Link>

                        {/* Sell */}
                        <Link to="/sell" className="sell-button">
                            + Sell
                        </Link>

                        {/* Logout */}
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="sell-button">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar