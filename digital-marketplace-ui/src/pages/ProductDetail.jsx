import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import API from '../api/axios'
import Navbar from '../components/Navbar'

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

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
    const stompClient = useRef(null)
    const [contacts, setContacts] = useState(null)

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
            webSocketFactory: () => new SockJS('https://iomp-production-099e.up.railway.app/ws'),
            onConnect: () => {
                client.subscribe(`/topic/bids/${id}`, (msg) => {
                    const data = JSON.parse(msg.body)
                    if (data.type === 'NEW_BID') {
                        setHighestBid({
                            bidAmount: data.bidAmount,
                            bidderName: data.bidderName,
                            timestamp: data.timestamp,
                        })
                        setLiveMessages(prev => [{
                            text: `${data.bidderName} bid ₹${data.bidAmount.toLocaleString()}`,
                            time: new Date().toLocaleTimeString(),
                        }, ...prev].slice(0, 5))
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
            setProduct(prev => prev ? { ...prev, status: 'SOLD' } : prev)
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
                        🏆 Auction Closed! Winner: <strong>{winner.bidderName}</strong>
                        {winner.bidAmount && ` with bid of ₹${winner.bidAmount.toLocaleString()}`}
                    </div>
                )}

                <div style={styles.grid}>
                    {/* ── Left Column ── */}
                    <div style={styles.left}>

                        {/* Image */}
                        <div style={styles.imageBox}>
                            {product.imagePath ? (
                                <img
                                    src={product.imagePath}
                                    alt={product.name}
                                    style={styles.image}
                                />
                            ) : (
                                <div style={styles.imagePlaceholder}>
                                    {isAuction ? '🔨' : '🛍️'}
                                </div>
                            )}
                            <span style={{
                                ...styles.badge,
                                backgroundColor: isAuction ? '#e9456022' : '#00b09b22',
                                color: isAuction ? '#e94560' : '#00b09b',
                            }}>
                {isAuction ? 'AUCTION' : 'DIRECT SALE'}
              </span>
                        </div>

                        {/* Product Info */}
                        <div style={styles.infoCard}>
                            <div style={styles.titleRow}>
                                <div>
                                    <h1 style={styles.title}>{product.name}</h1>
                                    {product.brand && (
                                        <p style={styles.brand}>by {product.brand}</p>
                                    )}
                                </div>
                                <span style={{
                                    ...styles.statusBadge,
                                    color: product.status === 'ACTIVE' ? '#00b09b' : '#e94560',
                                    backgroundColor: product.status === 'ACTIVE' ? '#00b09b22' : '#e9456022',
                                }}>
                  {product.status}
                </span>
                            </div>

                            {product.description && (
                                <p style={styles.description}>{product.description}</p>
                            )}

                            {/* Quick Details */}
                            <div style={styles.quickDetails}>
                                {product.category && (
                                    <div style={styles.detailChip}>📦 {product.category}</div>
                                )}
                                {product.location && (
                                    <div style={styles.detailChip}>📍 {product.location}</div>
                                )}
                                {product.productCondition && (
                                    <div style={styles.detailChip}>✨ {product.productCondition}</div>
                                )}
                                {product.warrantyRemaining && (
                                    <div style={styles.detailChip}>🛡️ {product.warrantyRemaining}</div>
                                )}
                            </div>
                        </div>

                        {/* Product History */}
                        <div style={styles.historyCard}>
                            <h3 style={styles.cardTitle}>📋 Product History</h3>
                            <div style={styles.historyGrid}>
                                {product.purchaseMonth && product.purchaseYear && (
                                    <div style={styles.historyItem}>
                                        <span style={styles.historyLabel}>Purchased</span>
                                        <span style={styles.historyValue}>
                      {MONTH_NAMES[product.purchaseMonth - 1]} {product.purchaseYear}
                    </span>
                                    </div>
                                )}
                                <div style={styles.historyItem}>
                                    <span style={styles.historyLabel}>Seller</span>
                                    <span style={styles.historyValue}>👤 {product.sellerName}</span>
                                </div>
                                <div style={styles.historyItem}>
                                    <span style={styles.historyLabel}>Listed On</span>
                                    <span style={styles.historyValue}>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
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

                    {/* ── Right Column ── */}
                    <div style={styles.right}>

                        {/* Price Card */}
                        <div style={styles.priceCard}>
                            <div style={styles.priceRow}>
                                <div>
                                    <p style={styles.priceLabel}>
                                        {isAuction ? 'Current Bid' : 'Price'}
                                    </p>
                                    <p style={styles.price}>
                                        ₹{product.currentPrice?.toLocaleString()}
                                    </p>
                                </div>
                                {isAuction && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={styles.priceLabel}>Starting Price</p>
                                        <p style={styles.startPrice}>
                                            ₹{product.startingPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isAuction && (
                                <>
                                    <div style={styles.divider} />
                                    <div style={styles.auctionMeta}>
                                        <div>
                                            <p style={styles.metaLabel}>Min Next Bid</p>
                                            <p style={styles.metaValue}>
                                                ₹{minimumBid?.toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={styles.metaLabel}>Ends At</p>
                                            <p style={{ ...styles.metaValue, color: '#ffa500' }}>
                                                {new Date(product.auctionEndTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Highest Bid */}
                        {highestBid && (
                            <div style={styles.highestBidCard}>
                                <p style={styles.highestLabel}>🏆 Highest Bid</p>
                                <p style={styles.highestAmount}>
                                    ₹{highestBid.bidAmount?.toLocaleString()}
                                </p>
                                <p style={styles.highestBidder}>by {highestBid.bidderName}</p>
                            </div>
                        )}

                        {/* Action Box */}
                        {product.status === 'ACTIVE' && (
                            <div style={styles.actionCard}>
                                {isAuction ? (
                                    <>
                                        <p style={styles.actionTitle}>Place Your Bid</p>
                                        <input
                                            type="number"
                                            placeholder={`Minimum ₹${minimumBid?.toLocaleString()}`}
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            style={styles.input}
                                            min={minimumBid}
                                        />
                                        <button onClick={handleBid} style={styles.bidButton}
                                                disabled={loading}>
                                            {loading ? 'Placing...' : '🔨 Place Bid'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleBuy} style={styles.buyButton}
                                            disabled={loading}>
                                        {loading ? 'Processing...' :
                                            `🛍️ Buy Now — ₹${product.currentPrice?.toLocaleString()}`}
                                    </button>
                                )}
                                {message && <p style={styles.success}>✅ {message}</p>}
                                {error && <p style={styles.errorText}>{error}</p>}
                            </div>
                        )}

                        {/* Contact Details */}
                        {contacts && (
                            <div style={styles.contactCard}>
                                <p style={styles.cardTitle}>📬 Contact Details</p>
                                <div style={styles.contactSection}>
                                    <p style={styles.contactRole}>🧑‍💼 Seller</p>
                                    <p style={styles.contactItem}>👤 {contacts.sellerName}</p>
                                    <p style={styles.contactItem}>✉️ {contacts.sellerEmail}</p>
                                    <p style={styles.contactItem}>📱 {contacts.sellerMobile || 'Not provided'}</p>
                                </div>
                                <div style={styles.divider} />
                                <div style={styles.contactSection}>
                                    <p style={styles.contactRole}>🏆 Winner</p>
                                    <p style={styles.contactItem}>👤 {contacts.winnerName}</p>
                                    <p style={styles.contactItem}>✉️ {contacts.winnerEmail}</p>
                                    <p style={styles.contactItem}>📱 {contacts.winnerMobile || 'Not provided'}</p>
                                </div>
                            </div>
                        )}

                        {/* Live Feed */}
                        {liveMessages.length > 0 && (
                            <div style={styles.liveFeedCard}>
                                <p style={styles.liveTitle}>
                                    <span style={styles.liveDot} />
                                    Live Updates
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
    page: { backgroundColor: '#0a0a15', minHeight: '100vh' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
    loading: { color: '#8888aa', padding: '40px', textAlign: 'center' },
    winnerBanner: {
        backgroundColor: '#ffa50015',
        color: '#ffa500',
        border: '1px solid #ffa50044',
        padding: '14px 20px',
        borderRadius: '10px',
        marginBottom: '28px',
        fontSize: '16px',
        textAlign: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '28px',
        alignItems: 'start',
    },
    left: { display: 'flex', flexDirection: 'column', gap: '20px' },
    right: { display: 'flex', flexDirection: 'column', gap: '16px' },
    imageBox: {
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        height: '300px',
        backgroundColor: '#12121f',
        border: '1px solid #1e1e3a',
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
    },
    badge: {
        position: 'absolute',
        top: '14px',
        left: '14px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    },
    infoCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid #1e1e3a',
    },
    titleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
    },
    title: { color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 },
    brand: { color: '#8888aa', fontSize: '14px', margin: '4px 0 0 0' },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    description: {
        color: '#aaaacc',
        fontSize: '14px',
        lineHeight: '1.7',
        margin: '0 0 16px 0',
    },
    quickDetails: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    detailChip: {
        backgroundColor: '#1e1e3a',
        color: '#aaaacc',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
    },
    historyCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid #1e1e3a',
    },
    cardTitle: {
        color: 'white',
        fontSize: '15px',
        fontWeight: '600',
        margin: '0 0 16px 0',
    },
    historyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
    },
    historyItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    historyLabel: { color: '#8888aa', fontSize: '12px' },
    historyValue: { color: 'white', fontSize: '14px', fontWeight: '500' },
    damagesBox: {
        backgroundColor: '#ff000011',
        border: '1px solid #ff000033',
        borderRadius: '8px',
        padding: '12px',
    },
    damagesLabel: { color: '#ff6b6b', fontSize: '13px', fontWeight: '600' },
    damagesText: { color: '#ffaaaa', fontSize: '13px', margin: '6px 0 0 0' },
    priceCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid #1e1e3a',
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceLabel: { color: '#8888aa', fontSize: '12px', margin: '0 0 4px 0' },
    price: { color: '#e94560', fontSize: '32px', fontWeight: '700', margin: 0 },
    startPrice: { color: '#8888aa', fontSize: '16px', margin: 0 },
    divider: { height: '1px', backgroundColor: '#1e1e3a', margin: '16px 0' },
    auctionMeta: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    metaLabel: { color: '#8888aa', fontSize: '12px', margin: '0 0 4px 0' },
    metaValue: { color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 },
    highestBidCard: {
        backgroundColor: '#e9456011',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #e9456033',
        textAlign: 'center',
    },
    highestLabel: { color: '#8888aa', fontSize: '13px', margin: '0 0 6px 0' },
    highestAmount: {
        color: '#e94560',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 4px 0',
    },
    highestBidder: { color: '#aaaacc', fontSize: '13px', margin: 0 },
    actionCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #1e1e3a',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    actionTitle: {
        color: 'white',
        fontSize: '15px',
        fontWeight: '600',
        margin: 0,
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #2a2a4a',
        backgroundColor: '#0a0a15',
        color: 'white',
        fontSize: '15px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    bidButton: {
        padding: '12px',
        backgroundColor: '#e94560',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    buyButton: {
        padding: '14px',
        backgroundColor: '#00b09b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    success: { color: '#00b09b', margin: 0, fontSize: '14px' },
    errorText: { color: '#ff6b6b', margin: 0, fontSize: '14px' },
    liveFeedCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #1e1e3a',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    liveTitle: {
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        margin: '0 0 4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    liveDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#e94560',
        display: 'inline-block',
    },
    liveItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#0a0a15',
        borderRadius: '6px',
    },
    liveText: { color: '#aaaacc', fontSize: '13px' },
    liveTime: { color: '#8888aa', fontSize: '11px' },
    contactCard: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #00b09b44',
    },
    contactSection: { display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' },
    contactRole: { color: '#00b09b', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' },
    contactItem: { color: '#aaaacc', fontSize: '13px', margin: 0 },
}

export default ProductDetail