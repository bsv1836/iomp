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
                    <h1 className="register-brand">Emporion</h1>
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
                                placeholder="Name"
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
                                placeholder="9876543210 (Optional)"
                                value={form.mobile} onChange={handleChange}
                                className="register-input"
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

                    {/* <div className="oauth-divider">
                        <span>or</span>
                    </div> */}

                    {/* <a href="http://localhost:8080/oauth2/authorization/google" className="oauth-google-btn">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="oauth-google-icon" />
                        Sign up with Google
                    </a> */}

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