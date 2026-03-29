import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import API from '../api/axios'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [showBell, setShowBell] = useState(false)

    useEffect(() => {
        if (token) fetchNotifications()
    }, [token, location.pathname])

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
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/products" style={styles.brand}>
                    🛒 <span style={styles.brandText}>Digital Marketplace</span>
                </Link>
                <Link to="/products" style={{
                    ...styles.navLink,
                    ...(isActive('/products') ? styles.activeLink : {})
                }}>Browse</Link>
            </div>

            <div style={styles.right}>
                {token ? (
                    <>
                        {/* Bell Icon */}
                        <div style={styles.bellWrapper}>
                            <button style={styles.bellButton} onClick={handleBellClick}>
                                🔔
                                {unreadCount > 0 && (
                                    <span style={styles.badge}>{unreadCount}</span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showBell && (
                                <div style={styles.dropdown}>
                                    <p style={styles.dropdownTitle}>Notifications</p>
                                    {notifications.length === 0 ? (
                                        <p style={styles.emptyNote}>No notifications yet</p>
                                    ) : (
                                        notifications.slice(0, 5).map(n => (
                                            <div
                                                key={n.id}
                                                style={{
                                                    ...styles.notifItem,
                                                    backgroundColor: n.read ? 'transparent' : '#e9456011'
                                                }}
                                                onClick={() => {
                                                    setShowBell(false)
                                                    if (n.productId) navigate(`/products/${n.productId}`)
                                                }}
                                            >
                                                <p style={styles.notifText}>{n.message}</p>
                                                <p style={styles.notifTime}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <Link to="/profile" style={styles.profileLink}>
                            👤 {userName}
                        </Link>

                        {/* Sell Button */}
                        <Link to="/sell" style={styles.sellButton}>
                            + Sell Product
                        </Link>

                        {/* Logout */}
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                        <Link to="/register" style={styles.registerButton}>
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        height: '64px',
        backgroundColor: '#0d0d1a',
        borderBottom: '1px solid #1e1e3a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    left: { display: 'flex', alignItems: 'center', gap: '32px' },
    brand: { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' },
    brandText: { color: 'white', fontWeight: '700', fontSize: '18px' },
    navLink: { color: '#8888aa', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
    activeLink: { color: 'white' },
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    bellWrapper: { position: 'relative' },
    bellButton: {
        background: 'transparent',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        position: 'relative',
        padding: '4px',
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#e94560',
        color: 'white',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '11px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: '40px',
        right: 0,
        width: '320px',
        backgroundColor: '#12121f',
        border: '1px solid #1e1e3a',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 200,
        overflow: 'hidden',
    },
    dropdownTitle: {
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        padding: '14px 16px',
        borderBottom: '1px solid #1e1e3a',
        margin: 0,
    },
    emptyNote: { color: '#8888aa', fontSize: '13px', padding: '16px', margin: 0 },
    notifItem: {
        padding: '12px 16px',
        borderBottom: '1px solid #1e1e3a',
        cursor: 'pointer',
    },
    notifText: { color: '#aaaacc', fontSize: '13px', margin: '0 0 4px 0', lineHeight: '1.5' },
    notifTime: { color: '#8888aa', fontSize: '11px', margin: 0 },
    profileLink: {
        color: '#aaaacc',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
    },
    sellButton: {
        backgroundColor: '#e94560',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 18px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        color: '#8888aa',
        border: '1px solid #2a2a4a',
        padding: '7px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    registerButton: {
        backgroundColor: '#e94560',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 18px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
    },
}

export default Navbar