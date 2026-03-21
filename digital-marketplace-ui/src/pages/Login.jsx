import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await API.post('/api/users/login', form)
            const token = typeof res.data === 'string' ? res.data : res.data.token
            localStorage.setItem('token', token)
            const payload = JSON.parse(atob(token.split('.')[1]))
            localStorage.setItem('userName', payload.sub)
            navigate('/products')
        } catch (err) {
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.left}>
                <div style={styles.brand}>🛒 Digital Marketplace</div>
                <h1 style={styles.tagline}>Buy, Sell &<br />Bid in Real Time</h1>
                <p style={styles.taglineSub}>
                    Join thousands of users buying and selling products through live auctions and direct sales.
                </p>
            </div>
            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Welcome back</h2>
                    <p style={styles.subtitle}>Login to your account</p>

                    {error && <div style={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input
                                name="email" type="email"
                                placeholder="you@gmail.com"
                                value={form.email} onChange={handleChange}
                                style={styles.input} required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <input
                                name="password" type="password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange}
                                style={styles.input} required
                            />
                        </div>
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? 'Logging in...' : 'Login →'}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.link}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#0a0a15',
    },
    left: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        backgroundColor: '#0d0d1a',
        borderRight: '1px solid #1e1e3a',
    },
    brand: {
        color: '#e94560',
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '40px',
        letterSpacing: '0.5px',
    },
    tagline: {
        color: 'white',
        fontSize: '42px',
        fontWeight: '800',
        lineHeight: '1.2',
        margin: '0 0 20px 0',
    },
    taglineSub: {
        color: '#8888aa',
        fontSize: '16px',
        lineHeight: '1.7',
        maxWidth: '360px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
    },
    card: {
        width: '100%',
        maxWidth: '380px',
    },
    title: {
        color: 'white',
        fontSize: '26px',
        fontWeight: '700',
        margin: '0 0 6px 0',
    },
    subtitle: {
        color: '#8888aa',
        fontSize: '15px',
        margin: '0 0 28px 0',
    },
    error: {
        backgroundColor: '#ff000022',
        color: '#ff6b6b',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    field: { marginBottom: '18px' },
    label: {
        display: 'block',
        color: '#aaaacc',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #2a2a4a',
        backgroundColor: '#12121f',
        color: 'white',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '13px',
        backgroundColor: '#e94560',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
    },
    footer: {
        color: '#8888aa',
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
    },
    link: { color: '#e94560', textDecoration: 'none', fontWeight: '500' },
}

export default Login