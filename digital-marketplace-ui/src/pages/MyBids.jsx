import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'

function MyBids() {
    const navigate = useNavigate()
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login')
            return
        }
        API.get('/api/bids/my-bids')
            .then(res => setBids(res.data))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Bids</h1>
                    <p style={styles.subtitle}>Track all your bidding activity</p>
                </div>

                {loading ? (
                    <div style={styles.loadingBox}>
                        <p style={styles.loadingText}>Loading your bids...</p>
                    </div>
                ) : bids.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={styles.emptyIcon}>🔨</p>
                        <p style={styles.emptyTitle}>No bids yet</p>
                        <p style={styles.emptyText}>
                            You haven't placed any bids yet. Browse active auctions to get started!
                        </p>
                        <button
                            style={styles.browseButton}
                            onClick={() => navigate('/products')}
                        >
                            Browse Auctions
                        </button>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {bids.map(bid => (
                            <div key={bid.bidId} style={styles.card}>
                                <div style={styles.cardLeft}>
                                    <h3 style={styles.productName}>{bid.productName}</h3>
                                    <p style={styles.time}>
                                        🕐 {new Date(bid.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div style={styles.cardRight}>
                                    <div style={styles.amountBox}>
                                        <span style={styles.amountLabel}>Your Bid</span>
                                        <span style={styles.amount}>
                      ₹{bid.bidAmount.toLocaleString()}
                    </span>
                                    </div>
                                    <button
                                        style={styles.viewButton}
                                        onClick={() => navigate(`/products/${bid.productId}`)}
                                    >
                                        View →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#0a0a15', minHeight: '100vh' },
    container: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' },
    header: { marginBottom: '32px' },
    title: { color: 'white', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' },
    subtitle: { color: '#8888aa', fontSize: '15px', margin: 0 },
    loadingBox: { textAlign: 'center', padding: '80px 0' },
    loadingText: { color: '#8888aa' },
    emptyBox: {
        backgroundColor: '#12121f',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
        border: '1px solid #1e1e3a',
    },
    emptyIcon: { fontSize: '48px', margin: '0 0 16px 0' },
    emptyTitle: {
        color: 'white',
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 8px 0',
    },
    emptyText: {
        color: '#8888aa',
        fontSize: '14px',
        margin: '0 0 24px 0',
        lineHeight: '1.6',
    },
    browseButton: {
        backgroundColor: '#e94560',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: {
        backgroundColor: '#12121f',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid #1e1e3a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
    },
    cardLeft: { flex: 1 },
    productName: {
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 6px 0',
    },
    time: { color: '#8888aa', fontSize: '13px', margin: 0 },
    cardRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    amountBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
    },
    amountLabel: { color: '#8888aa', fontSize: '11px' },
    amount: { color: '#e94560', fontWeight: '700', fontSize: '20px' },
    viewButton: {
        backgroundColor: 'transparent',
        color: '#e94560',
        border: '1px solid #e9456044',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
    },
}

export default MyBids