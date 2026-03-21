import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'USER'
    })
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
            await API.post('/api/users/register', form)
            navigate('/login')
        } catch (err) {
            setError('Registration failed. Email may already be in use.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.left}>
                <div style={styles.brand}>🛒 Digital Marketplace</div>
                <h1 style={styles.tagline}>Start Buying<br />& Selling Today</h1>
                <p style={styles.taglineSub}>
                    Create a free account and join our marketplace. List products for auction or direct sale in minutes.
                </p>
                <div style={styles.features}>
                    <div style={styles.feature}>✅ Free to join</div>
                    <div style={styles.feature}>✅ Buy and sell anything</div>
                    <div style={styles.feature}>✅ Real-time bidding</div>
                    <div style={styles.feature}>✅ Secure transactions</div>
                </div>
            </div>
            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Create account</h2>
                    <p style={styles.subtitle}>Join the marketplace for free</p>

                    {error && <div style={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                name="name" type="text"
                                placeholder="John Doe"
                                value={form.name} onChange={handleChange}
                                style={styles.input} required
                            />
                        </div>
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
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.link}>Login here</Link>
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
        margin: '0 0 32px 0',
    },
    features: { display: 'flex', flexDirection: 'column', gap: '10px' },
    feature: { color: '#aaaacc', fontSize: '14px' },
    right: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
    },
    card: { width: '100%', maxWidth: '380px' },
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

export default Register