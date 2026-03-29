import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', email: '', password: '', mobile: '', role: 'USER'
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
            {/* Left Panel */}
            <div style={styles.left}>
                <div style={styles.leftInner}>
                    <p style={styles.brand}>BidBazaar</p>
                    <h1 style={styles.tagline}>Start Buying<br />& Selling Today</h1>
                    <p style={styles.taglineSub}>
                        Create a free account and join our marketplace. List products for auction or direct sale in minutes.
                    </p>
                    <div style={styles.features}>
                        {[
                            'Free to join',
                            'Buy and sell anything',
                            'Real-time bidding',
                            'Secure transactions',
                        ].map(f => (
                            <div key={f} style={styles.featureItem}>
                                <div style={styles.featureDot} />
                                <span style={styles.featureText}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Create account</h2>
                    <p style={styles.subtitle}>Join the marketplace for free</p>

                    {error && <div style={styles.error}>{error}</div>}

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
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Mobile Number</label>
                            <input
                                name="mobile" type="tel"
                                placeholder="9876543210"
                                value={form.mobile} onChange={handleChange}
                                style={styles.input} required
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Password</label>
                            <input
                                name="password" type="password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange}
                                style={styles.input} required
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>

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
        width: '100vw',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#FDFBD4',
    },
    left: {
        backgroundColor: '#38240D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
    },
    leftInner: { maxWidth: '400px' },
    brand: {
        color: '#FDFBD4',
        fontSize: '22px',
        fontWeight: '500',
        marginBottom: '48px',
        letterSpacing: '0.3px',
    },
    tagline: {
        color: '#FDFBD4',
        fontSize: '40px',
        fontWeight: '500',
        lineHeight: '1.2',
        margin: '0 0 20px 0',
    },
    taglineSub: {
        color: '#c9b89a',
        fontSize: '15px',
        lineHeight: '1.8',
        margin: '0 0 40px 0',
    },
    features: { display: 'flex', flexDirection: 'column', gap: '14px' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
    featureDot: {
        width: '7px', height: '7px',
        borderRadius: '50%',
        backgroundColor: '#C05800',
        flexShrink: 0,
    },
    featureText: { color: '#c9b89a', fontSize: '14px' },
    right: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#FDFBD4',
    },
    card: { width: '100%', maxWidth: '400px' },
    title: {
        color: '#38240D',
        fontSize: '26px',
        fontWeight: '500',
        margin: '0 0 6px 0',
    },
    subtitle: {
        color: '#9a7a5a',
        fontSize: '14px',
        margin: '0 0 28px 0',
    },
    error: {
        backgroundColor: '#ff000015',
        color: '#a33000',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '13px',
        border: '0.5px solid #ff000030',
    },
    row: { display: 'flex', gap: '12px' },
    field: { marginBottom: '16px' },
    label: {
        display: 'block',
        color: '#713600',
        fontSize: '13px',
        marginBottom: '7px',
    },
    input: {
        width: '100%',
        padding: '11px 14px',
        borderRadius: '8px',
        border: '0.5px solid #d4c8b0',
        backgroundColor: '#ffffff',
        color: '#38240D',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#C05800',
        color: '#FDFBD4',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '4px',
    },
    footer: {
        color: '#9a7a5a',
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '13px',
    },
    link: { color: '#C05800', textDecoration: 'none', fontWeight: '500' },
}

export default Register