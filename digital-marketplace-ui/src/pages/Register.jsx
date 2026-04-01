import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import './Register.css'

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
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1 className="register-brand">BidBazaar</h1>
                    <p className="register-tagline-sub">Join the marketplace for free.</p>
                </div>

                <div className="register-card">
                    <h2 className="register-title">Create an account</h2>

                    {error && <div className="register-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="register-field">
                            <label className="register-label">Full Name</label>
                            <input
                                name="name" type="text"
                                placeholder="John Doe"
                                value={form.name} onChange={handleChange}
                                className="register-input" required
                            />
                        </div>
                        <div className="register-field">
                            <label className="register-label">Email</label>
                            <input
                                name="email" type="email"
                                placeholder="you@email.com"
                                value={form.email} onChange={handleChange}
                                className="register-input" required
                            />
                        </div>
                        <div className="register-field">
                            <label className="register-label">Mobile Number</label>
                            <input
                                name="mobile" type="tel"
                                placeholder="9876543210"
                                value={form.mobile} onChange={handleChange}
                                className="register-input" required
                            />
                        </div>
                        <div className="register-field">
                            <label className="register-label">Password</label>
                            <input
                                name="password" type="password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange}
                                className="register-input" required
                            />
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="register-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="register-link">Sign in instead</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register