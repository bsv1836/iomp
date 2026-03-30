import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import API from '../api/axios'
import Navbar from '../components/Navbar'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [highestBid, setHighestBid] = useState(null)
    const [bidAmount, setBidAmount] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [liveMessages, setLiveMessages] = useState([])
    const [winner, setWinner] = useState(null)
    const [contacts, setContacts] = useState(null)
    const stompClient = useRef(null)

    useEffect(() => {
        API.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => navigate('/products'))
    }, [id])

    useEffect(() => {
        API.get(`/api/bids/${id}/highest`)
            .then(res => setHighestBid(res.data))
            .catch(() => setHighestBid(null))
    }, [id])

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`),
            onConnect: () => {
                client.subscribe(`/topic/bids/${id}`, (msg) => {
                    const data = JSON.parse(msg.body)
                    if (data.type === 'NEW_BID') {
                        setHighestBid({ bidAmount: data.bidAmount, bidderName: data.bidderName, timestamp: data.timestamp })
                        setLiveMessages(prev => [{ text: `${data.bidderName} bid ₹${data.bidAmount.toLocaleString()}`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5))
                        setProduct(prev => prev ? { ...prev, currentPrice: data.bidAmount } : prev)
                    }
                    if (data.type === 'AUCTION_CLOSED') {
                        setWinner(data)
                        setProduct(prev => prev ? { ...prev, status: 'SOLD' } : prev)
                    }
                })
            },
        })
        client.activate()
        stompClient.current = client
        return () => client.deactivate()
    }, [id])

    useEffect(() => {
        if (product?.status === 'SOLD' && localStorage.getItem('token')) {
            API.get(`/api/products/${id}/contacts`)
                .then(res => setContacts(res.data))
                .catch(() => setContacts(null))
        }
    }, [product?.status])

    const handleBid = async () => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        setLoading(true); setError(''); setMessage('')
        try {
            await API.post(`/api/bids/${id}`, { bidAmount: parseFloat(bidAmount) })
            setMessage('Bid placed successfully!')
            setBidAmount('')
        } catch (err) {
            setError(err.response?.data || 'Failed to place bid.')
        } finally { setLoading(false) }
    }

    const handleBuy = async () => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        setLoading(true); setError('')
        try {
            const res = await API.post(`/api/products/${id}/buy`)
            setMessage(res.data.message)
            setProduct(prev => prev ? { ...prev, status: 'PENDING' } : prev)
        } catch (err) {
            setError(err.response?.data || 'Failed to complete purchase.')
        } finally { setLoading(false) }
    }

    if (!product) return (
        <div style={styles.page}><Navbar />
            <div style={styles.loading}>Loading...</div>
        </div>
    )

    const isAuction = product.saleType === 'AUCTION'
    const minimumBid = product.currentPrice + product.bidIncrement

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>

                {/* Winner Banner */}
                {winner && (
                    <div style={styles.winnerBanner}>
                        🏆 Auction closed! Winner: <strong>{winner.bidderName}</strong>
                        {winner.bidAmount && ` — ₹${winner.bidAmount.toLocaleString()}`}
                    </div>
                )}

                <div style={styles.grid}>
                    {/* Left */}
                    <div style={styles.left}>

                        {/* Image */}
                        <div style={styles.imageBox}>
                            {product.imagePath ? (
                                <img src={product.imagePath} alt={product.name} style={styles.image} />
                            ) : (
                                <div style={styles.imagePlaceholder}>{isAuction ? '🔨' : '🛍️'}</div>
                            )}
                            <span style={{
                                ...styles.badge,
                                backgroundColor: isAuction ? '#C0580018' : '#71360018',
                                color: isAuction ? '#C05800' : '#713600',
                                border: `0.5px solid ${isAuction ? '#C0580044' : '#71360044'}`,
                            }}>
                                {isAuction ? 'AUCTION' : 'DIRECT SALE'}
                            </span>
                        </div>

                        {/* Info Card */}
                        <div style={styles.card}>
                            <div style={styles.titleRow}>
                                <div>
                                    <h1 style={styles.title}>{product.name}</h1>
                                    {product.brand && <p style={styles.brand}>by {product.brand}</p>}
                                </div>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: product.status === 'ACTIVE' ? '#71360015' : '#9a7a5a15',
                                    color: product.status === 'ACTIVE' ? '#713600' : '#9a7a5a',
                                }}>
                                    {product.status}
                                </span>
                            </div>
                            {product.description && <p style={styles.description}>{product.description}</p>}
                            <div style={styles.chips}>
                                {product.category && <span style={styles.chip}>📦 {product.category}</span>}
                                {product.location && <span style={styles.chip}>📍 {product.location}</span>}
                                {product.productCondition && <span style={styles.chip}>✨ {product.productCondition}</span>}
                                {product.warrantyRemaining && <span style={styles.chip}>🛡️ {product.warrantyRemaining}</span>}
                            </div>
                        </div>

                        {/* History Card */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Product History</h3>
                            <div style={styles.historyGrid}>
                                {product.purchaseMonth && product.purchaseYear && (
                                    <div style={styles.historyItem}>
                                        <span style={styles.historyLabel}>Purchased</span>
                                        <span style={styles.historyValue}>{MONTH_NAMES[product.purchaseMonth - 1]} {product.purchaseYear}</span>
                                    </div>
                                )}
                                <div style={styles.historyItem}>
                                    <span style={styles.historyLabel}>Seller</span>
                                    <span style={styles.historyValue}>{product.sellerName}</span>
                                </div>
                                <div style={styles.historyItem}>
                                    <span style={styles.historyLabel}>Listed On</span>
                                    <span style={styles.historyValue}>{new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {product.damages && (
                                <div style={styles.damagesBox}>
                                    <span style={styles.damagesLabel}>⚠️ Damages / Defects</span>
                                    <p style={styles.damagesText}>{product.damages}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right */}
                    <div style={styles.right}>

                        {/* Price Card */}
                        <div style={styles.card}>
                            <div style={styles.priceRow}>
                                <div>
                                    <p style={styles.priceLabel}>{isAuction ? 'Current Bid' : 'Price'}</p>
                                    <p style={styles.price}>₹{product.currentPrice?.toLocaleString()}</p>
                                </div>
                                {isAuction && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={styles.priceLabel}>Starting Price</p>
                                        <p style={styles.startPrice}>₹{product.startingPrice?.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            {isAuction && (
                                <>
                                    <div style={styles.divider} />
                                    <div style={styles.auctionMeta}>
                                        <div>
                                            <p style={styles.metaLabel}>Min Next Bid</p>
                                            <p style={styles.metaValue}>₹{minimumBid?.toLocaleString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={styles.metaLabel}>Ends At</p>
                                            <p style={{ ...styles.metaValue, color: '#C05800' }}>{new Date(product.auctionEndTime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Highest Bid */}
                        {highestBid && (
                            <div style={styles.highestBidCard}>
                                <p style={styles.highestLabel}>Highest Bid</p>
                                <p style={styles.highestAmount}>₹{highestBid.bidAmount?.toLocaleString()}</p>
                                <p style={styles.highestBidder}>by {highestBid.bidderName}</p>
                            </div>
                        )}

                        {/* Action Box */}
                        {product.status === 'ACTIVE' && (
                            <div style={styles.card}>
                                {isAuction ? (
                                    <>
                                        <p style={styles.cardTitle}>Place Your Bid</p>
                                        <input
                                            type="number"
                                            placeholder={`Minimum ₹${minimumBid?.toLocaleString()}`}
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            style={styles.input}
                                            min={minimumBid}
                                        />
                                        <button onClick={handleBid} style={styles.bidButton} disabled={loading}>
                                            {loading ? 'Placing...' : 'Place Bid'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleBuy} style={styles.buyButton} disabled={loading}>
                                        {loading ? 'Processing...' : `Buy Now — ₹${product.currentPrice?.toLocaleString()}`}
                                    </button>
                                )}
                                {message && <p style={styles.success}>{message}</p>}
                                {error && <p style={styles.errorText}>{error}</p>}
                            </div>
                        )}

                        {/* Pending notice */}
                        {product.status === 'PENDING' && !contacts && (
                            <div style={styles.pendingBox}>
                                <p style={styles.pendingText}>⏳ Awaiting seller confirmation</p>
                            </div>
                        )}

                        {/* Contact Details */}
                        {contacts && (
                            <div style={styles.contactCard}>
                                <p style={styles.cardTitle}>Contact Details</p>
                                <div style={styles.contactSection}>
                                    <p style={styles.contactRole}>Seller</p>
                                    <p style={styles.contactItem}>👤 {contacts.sellerName}</p>
                                    <p style={styles.contactItem}>✉️ {contacts.sellerEmail}</p>
                                    <p style={styles.contactItem}>📱 {contacts.sellerMobile || 'Not provided'}</p>
                                </div>
                                <div style={styles.divider} />
                                <div style={styles.contactSection}>
                                    <p style={styles.contactRole}>Buyer</p>
                                    <p style={styles.contactItem}>👤 {contacts.winnerName}</p>
                                    <p style={styles.contactItem}>✉️ {contacts.winnerEmail}</p>
                                    <p style={styles.contactItem}>📱 {contacts.winnerMobile || 'Not provided'}</p>
                                </div>
                            </div>
                        )}

                        {/* Live Feed */}
                        {liveMessages.length > 0 && (
                            <div style={styles.card}>
                                <p style={{ ...styles.cardTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={styles.liveDot} /> Live Updates
                                </p>
                                {liveMessages.map((msg, i) => (
                                    <div key={i} style={styles.liveItem}>
                                        <span style={styles.liveText}>{msg.text}</span>
                                        <span style={styles.liveTime}>{msg.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#f7f4ec', minHeight: '100vh' },
    container: { padding: '36px 48px' },
    loading: { color: '#9a7a5a', padding: '40px', textAlign: 'center' },
    winnerBanner: {
        backgroundColor: '#C0580015',
        color: '#713600',
        border: '0.5px solid #C0580044',
        padding: '14px 20px',
        borderRadius: '10px',
        marginBottom: '28px',
        fontSize: '15px',
        textAlign: 'center',
    },
    grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' },
    left: { display: 'flex', flexDirection: 'column', gap: '16px' },
    right: { display: 'flex', flexDirection: 'column', gap: '14px' },
    imageBox: {
        position: 'relative', borderRadius: '14px',
        overflow: 'hidden', height: '300px',
        backgroundColor: '#FDFBD4', border: '0.5px solid #e8e0d0',
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: {
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px',
    },
    badge: {
        position: 'absolute', top: '14px', left: '14px',
        padding: '4px 12px', borderRadius: '20px',
        fontSize: '11px', fontWeight: '600', letterSpacing: '0.4px',
    },
    card: {
        backgroundColor: '#fff', borderRadius: '14px',
        padding: '22px', border: '0.5px solid #e8e0d0',
        display: 'flex', flexDirection: 'column', gap: '12px',
    },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { color: '#38240D', fontSize: '24px', fontWeight: '500', margin: 0 },
    brand: { color: '#9a7a5a', fontSize: '14px', margin: '4px 0 0 0' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
    description: { color: '#713600', fontSize: '14px', lineHeight: '1.7', margin: 0 },
    chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    chip: {
        backgroundColor: '#f5f0e8', color: '#713600',
        padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
    },
    cardTitle: { color: '#38240D', fontSize: '15px', fontWeight: '500', margin: 0 },
    historyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    historyItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    historyLabel: { color: '#9a7a5a', fontSize: '12px' },
    historyValue: { color: '#38240D', fontSize: '14px' },
    damagesBox: {
        backgroundColor: '#ff000008', border: '0.5px solid #ff000025',
        borderRadius: '8px', padding: '12px',
    },
    damagesLabel: { color: '#a33000', fontSize: '13px' },
    damagesText: { color: '#713600', fontSize: '13px', margin: '6px 0 0 0' },
    priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceLabel: { color: '#9a7a5a', fontSize: '12px', margin: '0 0 4px 0' },
    price: { color: '#C05800', fontSize: '32px', fontWeight: '500', margin: 0 },
    startPrice: { color: '#9a7a5a', fontSize: '16px', margin: 0 },
    divider: { height: '0.5px', backgroundColor: '#e8e0d0', margin: '4px 0' },
    auctionMeta: { display: 'flex', justifyContent: 'space-between' },
    metaLabel: { color: '#9a7a5a', fontSize: '12px', margin: '0 0 4px 0' },
    metaValue: { color: '#38240D', fontSize: '14px', margin: 0 },
    highestBidCard: {
        backgroundColor: '#C0580010', borderRadius: '14px',
        padding: '18px', border: '0.5px solid #C0580033', textAlign: 'center',
    },
    highestLabel: { color: '#9a7a5a', fontSize: '13px', margin: '0 0 6px 0' },
    highestAmount: { color: '#C05800', fontSize: '28px', fontWeight: '500', margin: '0 0 4px 0' },
    highestBidder: { color: '#713600', fontSize: '13px', margin: 0 },
    input: {
        width: '100%', padding: '11px 14px', borderRadius: '8px',
        border: '0.5px solid #d4c8b0', backgroundColor: '#faf9f5',
        color: '#38240D', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
    },
    bidButton: {
        padding: '12px', backgroundColor: '#C05800', color: '#FDFBD4',
        border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    },
    buyButton: {
        padding: '14px', backgroundColor: '#713600', color: '#FDFBD4',
        border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    },
    success: { color: '#3a7a3a', margin: 0, fontSize: '13px' },
    errorText: { color: '#a33000', margin: 0, fontSize: '13px' },
    pendingBox: {
        backgroundColor: '#C0580010', borderRadius: '10px',
        padding: '14px', border: '0.5px solid #C0580033', textAlign: 'center',
    },
    pendingText: { color: '#C05800', fontSize: '14px', margin: 0 },
    contactCard: {
        backgroundColor: '#fff', borderRadius: '14px',
        padding: '22px', border: '0.5px solid #71360033',
    },
    contactSection: { display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' },
    contactRole: { color: '#713600', fontSize: '12px', fontWeight: '500', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
    contactItem: { color: '#38240D', fontSize: '13px', margin: 0 },
    liveDot: {
        width: '8px', height: '8px', borderRadius: '50%',
        backgroundColor: '#C05800', display: 'inline-block',
    },
    liveItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', backgroundColor: '#faf9f5', borderRadius: '6px',
    },
    liveText: { color: '#713600', fontSize: '13px' },
    liveTime: { color: '#9a7a5a', fontSize: '11px' },
}

export default ProductDetail