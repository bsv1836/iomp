import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import './Login.css'

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
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userName', res.data.name)
            localStorage.setItem('userId', res.data.id)
            localStorage.setItem('profilePhoto', res.data.profilePhoto || '')
            navigate('/products')
        } catch (err) {
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1 className="login-brand">BidBazaar</h1>
                    <p className="login-tagline-sub">Welcome back. Please sign in to your account.</p>
                </div>

                <div className="login-card">
                    <h2 className="login-title">Sign in</h2>

                    {error && <div className="login-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label className="login-label">Email</label>
                            <input
                                name="email" type="email"
                                placeholder="you@email.com"
                                value={form.email} onChange={handleChange}
                                className="login-input" required
                            />
                        </div>
                        <div className="login-field">
                            <label className="login-label">Password</label>
                            <input
                                name="password" type="password"
                                placeholder="••••••••"
                                value={form.password} onChange={handleChange}
                                className="login-input" required
                            />
                        </div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>


                    <p className="login-footer">
                        Don't have an account?{' '}
                        <Link to="/register" className="login-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login