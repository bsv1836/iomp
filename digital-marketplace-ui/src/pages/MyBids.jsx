import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import './MyBids.css'

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
        <div className="mybids-page">
            <Navbar />
            <div className="mybids-container">
                <div className="mybids-header">
                    <h1 className="mybids-title">My Bids</h1>
                    <p className="mybids-subtitle">Track all your bidding activity</p>
                </div>

                {loading ? (
                    <div className="mybids-loading-box">
                        <p className="mybids-loading-text">Loading your bids...</p>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="mybids-empty-box">
                        <p className="mybids-empty-icon">🔨</p>
                        <p className="mybids-empty-title">No bids yet</p>
                        <p className="mybids-empty-text">
                            You haven't placed any bids yet. Browse active auctions to get started!
                        </p>
                        <button
                            className="mybids-browse-button"
                            onClick={() => navigate('/products')}
                        >
                            Browse Auctions
                        </button>
                    </div>
                ) : (
                    <div className="mybids-list">
                        {bids.map(bid => (
                            <div key={bid.bidId} className="mybids-card">
                                <div className="mybids-card-left">
                                    <h3 className="mybids-product-name">{bid.productName}</h3>
                                    <p className="mybids-time">
                                        🕐 {new Date(bid.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="mybids-card-right">
                                    <div className="mybids-amount-box">
                                        <span className="mybids-amount-label">Your Bid</span>
                                        <span className="mybids-amount">
                                          ₹{bid.bidAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        className="mybids-view-button"
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

export default MyBids