import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import API from '../api/axios'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [showBell, setShowBell] = useState(false)
    const bellRef = useRef(null)

    useEffect(() => {
        if (token) fetchNotifications()
    }, [token, location.pathname])

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
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/products" style={styles.brand}>
                    BidBazaar
                </Link>
                <Link to="/products" style={{
                    ...styles.navLink,
                    ...(isActive('/products') ? styles.activeLink : {})
                }}>Browse</Link>
            </div>

            <div style={styles.right}>
                {token ? (
                    <>
                        {/* Bell */}
                        <div style={styles.bellWrapper} ref={bellRef}>
                            <button style={styles.bellButton} onClick={handleBellClick}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FDFBD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {unreadCount > 0 && (
                                    <span style={styles.badge}>{unreadCount}</span>
                                )}
                            </button>

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
                                                    backgroundColor: n.read ? 'transparent' : '#C0580011'
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
                            <div style={styles.avatar}>
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <span style={styles.userName}>{userName}</span>
                        </Link>

                        {/* Sell */}
                        <Link to="/sell" style={styles.sellButton}>
                            + Sell
                        </Link>

                        {/* Logout */}
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                        <Link to="/register" style={styles.sellButton}>
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
        height: '60px',
        backgroundColor: '#38240D',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    left: { display: 'flex', alignItems: 'center', gap: '32px' },
    brand: {
        textDecoration: 'none',
        color: '#FDFBD4',
        fontWeight: '500',
        fontSize: '20px',
        letterSpacing: '0.3px',
    },
    navLink: {
        color: '#c9b89a',
        textDecoration: 'none',
        fontSize: '14px',
    },
    activeLink: { color: '#FDFBD4' },
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    bellWrapper: { position: 'relative' },
    bellButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: '0px',
        right: '0px',
        backgroundColor: '#C05800',
        color: '#FDFBD4',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        fontSize: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: '44px',
        right: 0,
        width: '300px',
        backgroundColor: '#fff',
        border: '0.5px solid #e8e0d0',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(56,36,13,0.12)',
        zIndex: 200,
        overflow: 'hidden',
    },
    dropdownTitle: {
        color: '#38240D',
        fontWeight: '500',
        fontSize: '13px',
        padding: '12px 16px',
        borderBottom: '0.5px solid #e8e0d0',
        margin: 0,
    },
    emptyNote: { color: '#9a7a5a', fontSize: '13px', padding: '16px', margin: 0 },
    notifItem: {
        padding: '12px 16px',
        borderBottom: '0.5px solid #e8e0d0',
        cursor: 'pointer',
    },
    notifText: { color: '#38240D', fontSize: '13px', margin: '0 0 4px 0', lineHeight: '1.5' },
    notifTime: { color: '#9a7a5a', fontSize: '11px', margin: 0 },
    profileLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
    },
    avatar: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#C05800',
        color: '#FDFBD4',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        color: '#FDFBD4',
        fontSize: '13px',
    },
    sellButton: {
        backgroundColor: '#C05800',
        color: '#FDFBD4',
        textDecoration: 'none',
        padding: '7px 16px',
        borderRadius: '7px',
        fontSize: '13px',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        color: '#c9b89a',
        border: '0.5px solid #6b4c2a',
        padding: '6px 14px',
        borderRadius: '7px',
        fontSize: '13px',
        cursor: 'pointer',
    },
}

export default Navbar