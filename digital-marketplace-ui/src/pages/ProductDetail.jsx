import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import './ProductDetail.css'

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
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const userId = parseInt(localStorage.getItem('userId'))
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
                        setHighestBid({ 
                            bidAmount: data.bidAmount, 
                            bidderName: data.bidderName, 
                            bidderProfilePhoto: data.bidderProfilePhoto,
                            timestamp: data.timestamp 
                        })
                        setLiveMessages(prev => [{ 
                            text: `${data.bidderName} bid ₹${data.bidAmount.toLocaleString()}`, 
                            time: new Date().toLocaleTimeString(),
                            photo: data.bidderProfilePhoto
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
            setProduct(prev => prev ? { ...prev, status: 'PENDING' } : prev)
            setShowConfirmModal(false)
        } catch (err) {
            setError(err.response?.data || 'Failed to complete purchase.')
        } finally { setLoading(false) }
    }

    const handleConfirmSale = async () => {
        setLoading(true); setError('')
        try {
            await API.post(`/api/products/${id}/confirm-sale`)
            setMessage('Sale confirmed successfully!')
            setProduct(prev => prev ? { ...prev, status: 'SOLD' } : prev)
        } catch (err) {
            setError(err.response?.data || 'Failed to confirm sale.')
        } finally { setLoading(false) }
    }

    if (!product) return (
        <div className="product-detail-page"><Navbar />
            <div className="product-detail-loading">Loading...</div>
        </div>
    )

    const isAuction = product.saleType === 'AUCTION'
    const minimumBid = product.currentPrice + product.bidIncrement
    const isSeller = product.sellerId === userId

    return (
        <div className="product-detail-page">
            <Navbar />
            <div className="product-detail-container">

                {/* Winner Banner */}
                {winner && (
                    <div className="product-winner-banner">
                        🏆 Auction closed! Winner: <strong>{winner.bidderName}</strong>
                        {winner.bidAmount && ` — ₹${winner.bidAmount.toLocaleString()}`}
                    </div>
                )}

                <div className="product-detail-grid">
                    {/* Left */}
                    <div className="product-detail-left">

                        {/* Image */}
                        <div className="product-detail-image-box">
                            {product.imagePath ? (
                                <img src={product.imagePath} alt={product.name} className="product-detail-image" />
                            ) : (
                                <div className="product-detail-image-placeholder">{isAuction ? '🔨' : '🛍️'}</div>
                            )}
                            <span className={`product-detail-badge ${isAuction ? 'auction' : 'direct'}`}>
                                {isAuction ? 'AUCTION' : 'DIRECT SALE'}
                            </span>
                        </div>

                        {/* Info Card */}
                        <div className="product-detail-card">
                            <div className="product-title-row">
                                <div>
                                    <h1 className="product-title">{product.name}</h1>
                                    {product.brand && <p className="product-brand">by {product.brand}</p>}
                                </div>
                                <span className={`product-status-badge ${product.status === 'ACTIVE' ? 'status-active' : 'status-other'}`}>
                                    {product.status}
                                </span>
                            </div>
                            {product.description && <p className="product-description">{product.description}</p>}
                            <div className="product-chips">
                                {product.category && <span className="product-chip">Category: {product.category}</span>}
                                {product.location && <span className="product-chip">Location: {product.location}</span>}
                                {product.productCondition && <span className="product-chip">Condition: {product.productCondition}</span>}
                                {product.warrantyRemaining && <span className="product-chip">Warranty: {product.warrantyRemaining}</span>}
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="product-detail-card">
                            <h3 className="product-card-title">Product History</h3>
                            <div className="product-history-grid">
                                {product.purchaseMonth && product.purchaseYear && (
                                    <div className="product-history-item">
                                        <span className="product-history-label">Purchased</span>
                                        <span className="product-history-value">{MONTH_NAMES[product.purchaseMonth - 1]} {product.purchaseYear}</span>
                                    </div>
                                )}
                                <div className="product-history-item seller-row">
                                    <span className="product-history-label">Seller</span>
                                    <div className="product-history-seller">
                                        <div className="seller-mini-avatar">
                                            {product.sellerProfilePhoto ? (
                                                <img src={product.sellerProfilePhoto} alt={product.sellerName} className="seller-avatar-img" />
                                            ) : (
                                                product.sellerName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="product-history-value">{product.sellerName}</span>
                                    </div>
                                </div>
                                <div className="product-history-item">
                                    <span className="product-history-label">Listed On</span>
                                    <span className="product-history-value">{new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {product.damages && (
                                <div className="product-damages-box">
                                    <span className="product-damages-label">⚠️ Damages / Defects</span>
                                    <p className="product-damages-text">{product.damages}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="product-detail-right">

                        {/* Price Card */}
                        <div className="product-detail-card">
                            <div className="product-price-row">
                                <div>
                                    <p className="product-price-label">{isAuction ? 'Current Bid' : 'Price'}</p>
                                    <p className="product-price-value">₹{product.currentPrice?.toLocaleString()}</p>
                                </div>
                                {isAuction && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="product-price-label">Starting Price</p>
                                        <p className="product-start-price">₹{product.startingPrice?.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            {isAuction && (
                                <>
                                    <div className="product-divider" />
                                    <div className="product-auction-meta">
                                        <div>
                                            <p className="product-meta-label">Min Next Bid</p>
                                            <p className="product-meta-value">₹{minimumBid?.toLocaleString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p className="product-meta-label">Ends At</p>
                                            <p className="product-meta-value highlight">{new Date(product.auctionEndTime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Highest Bid */}
                        {highestBid && (
                            <div className="product-highest-bid-card">
                                <p className="product-highest-label">Highest Bid</p>
                                <div className="highest-bid-user">
                                    <div className="highest-bid-avatar">
                                        {highestBid.bidderProfilePhoto ? (
                                            <img src={highestBid.bidderProfilePhoto} alt={highestBid.bidderName} className="seller-avatar-img" />
                                        ) : (
                                            highestBid.bidderName?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="highest-bid-info">
                                        <p className="product-highest-amount">₹{highestBid.bidAmount?.toLocaleString()}</p>
                                        <p className="product-highest-bidder">by {highestBid.bidderName}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Box */}
                        {product.status === 'ACTIVE' && !isSeller && (
                            <div className="product-detail-card">
                                {isAuction ? (
                                    <>
                                        <p className="product-card-title">Place Your Bid</p>
                                        <input
                                            type="number"
                                            placeholder={`Minimum ₹${minimumBid?.toLocaleString()}`}
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            className="product-bid-input"
                                            min={minimumBid}
                                        />
                                        <button onClick={handleBid} className="product-action-btn" disabled={loading}>
                                            {loading ? 'Placing...' : 'Place Bid'}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setShowConfirmModal(true)} 
                                        className="product-action-btn" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : `Buy Now — ₹${product.currentPrice?.toLocaleString()}`}
                                    </button>
                                )}
                                {message && <p className="product-success-text">{message}</p>}
                                {error && <p className="product-error-text">{error}</p>}
                            </div>
                        )}

                        {/* Pending notice / Seller confirm */}
                        {product.status === 'PENDING' && !contacts && (
                            <div className="product-pending-box">
                                {isSeller ? (
                                    <>
                                        <p className="product-pending-text" style={{ marginBottom: '16px' }}>⏳ Sale awaiting your confirmation</p>
                                        <button 
                                            onClick={handleConfirmSale} 
                                            className="product-action-btn confirm-sale-btn" 
                                            disabled={loading}
                                        >
                                            {loading ? 'Confirming...' : 'Confirm Sale'}
                                        </button>
                                    </>
                                ) : (
                                    <p className="product-pending-text">⏳ Awaiting seller confirmation</p>
                                )}
                            </div>
                        )}

                        {/* Contact Details */}
                        {contacts && (
                            <div className="product-contact-card">
                                <p className="product-card-title">Contact Details</p>
                                <div className="product-contact-section">
                                    <p className="product-contact-role">Seller</p>
                                    <div className="contact-user-info">
                                        <div className="contact-avatar">
                                            {contacts.sellerProfilePhoto ? (
                                                <img src={contacts.sellerProfilePhoto} alt={contacts.sellerName} className="seller-avatar-img" />
                                            ) : (
                                                contacts.sellerName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="product-contact-item">👤 {contacts.sellerName}</p>
                                            <p className="product-contact-item">✉️ {contacts.sellerEmail}</p>
                                            <p className="product-contact-item">📱 {contacts.sellerMobile || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="product-divider" />
                                <div className="product-contact-section">
                                    <p className="product-contact-role">Buyer</p>
                                    <div className="contact-user-info">
                                        <div className="contact-avatar">
                                            {contacts.winnerProfilePhoto ? (
                                                <img src={contacts.winnerProfilePhoto} alt={contacts.winnerName} className="seller-avatar-img" />
                                            ) : (
                                                contacts.winnerName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="product-contact-item">👤 {contacts.winnerName}</p>
                                            <p className="product-contact-item">✉️ {contacts.winnerEmail}</p>
                                            <p className="product-contact-item">📱 {contacts.winnerMobile || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Feed */}
                        {liveMessages.length > 0 && (
                            <div className="product-detail-card">
                                <p className="product-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="product-live-dot" /> Live Updates
                                </p>
                                {liveMessages.map((msg, i) => (
                                    <div key={i} className="product-live-item">
                                        <div className="live-avatar">
                                            {msg.photo ? (
                                                <img src={msg.photo} alt="user" className="seller-avatar-img" />
                                            ) : (
                                                '👤'
                                            )}
                                        </div>
                                        <div className="live-content">
                                            <span className="product-live-text">{msg.text}</span>
                                            <span className="product-live-time">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Buy Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Purchase</h2>
                            <button className="modal-close" onClick={() => setShowConfirmModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to purchase <strong>{product.name}</strong>?</p>
                            <div className="modal-price-summary">
                                <span className="label">Total Price:</span>
                                <span className="amount">₹{product.currentPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)} disabled={loading}>Cancel</button>
                            <button className="modal-btn-confirm" onClick={handleBuy} disabled={loading}>
                                {loading ? 'Processing...' : 'Confirm Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDetail