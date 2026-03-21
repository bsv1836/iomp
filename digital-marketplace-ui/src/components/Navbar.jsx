import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')

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
                }}>
                    Browse
                </Link>
                {token && (
                    <Link to="/my-bids" style={{
                        ...styles.navLink,
                        ...(isActive('/my-bids') ? styles.activeLink : {})
                    }}>
                        My Bids
                    </Link>
                )}
            </div>

            <div style={styles.right}>
                {token ? (
                    <>
                        <span style={styles.userEmail}>👤 {userName}</span>
                        <Link to="/sell" style={styles.sellButton}>
                            + Sell Product
                        </Link>
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
        backdropFilter: 'blur(10px)',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    },
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '18px',
    },
    brandText: {
        color: 'white',
        fontWeight: '700',
        letterSpacing: '-0.5px',
    },
    navLink: {
        color: '#8888aa',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    activeLink: {
        color: 'white',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userEmail: {
        color: '#8888aa',
        fontSize: '13px',
    },
    sellButton: {
        backgroundColor: '#e94560',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 18px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '0.3px',
        transition: 'background 0.2s',
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