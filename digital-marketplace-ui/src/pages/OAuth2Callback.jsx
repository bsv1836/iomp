import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function OAuth2Callback() {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        const token = queryParams.get('token')
        const name = queryParams.get('name')

        if (token && name) {
            localStorage.setItem('token', token)
            localStorage.setItem('userName', name)
            
            // Dispatch completely custom event for cross-component re-renders 
            window.dispatchEvent(new Event('storage'))

            navigate('/products')
        } else {
            console.error("Missing token or name in OAuth2 redirect")
            navigate('/login')
        }
    }, [location.search, navigate])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px', animation: 'pulseGlow 2s infinite' }}>
                Completing sign-in...
            </p>
        </div>
    )
}

export default OAuth2Callback
