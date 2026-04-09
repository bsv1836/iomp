import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Profile.css'

function Profile() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [listedProducts, setListedProducts] = useState([])
    const [wonProducts, setWonProducts] = useState([])
    const [myBids, setMyBids] = useState([])
    const [activeTab, setActiveTab] = useState('listed')
    const [searchTerm, setSearchTerm] = useState('')
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saveMsg, setSaveMsg] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            const [profileRes, listedRes, wonRes, bidsRes] = await Promise.all([
                API.get('/api/users/profile'),
                API.get('/api/products/my'),
                API.get('/api/products/won'),
                API.get('/api/bids/my-bids'),
            ])
            setProfile(profileRes.data)
            setForm({
                name: profileRes.data.name,
                mobile: profileRes.data.mobile || '',
                location: profileRes.data.location || '',
            })
            setListedProducts(listedRes.data)
            setWonProducts(wonRes.data)
            setMyBids(bidsRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const res = await API.put('/api/users/profile', form)
            localStorage.setItem('userName', res.data.name)
            setProfile(prev => ({ ...prev, ...res.data }))
            setSaveMsg('Profile updated successfully!')
            setEditing(false)
            setTimeout(() => setSaveMsg(''), 3000)
        } catch (err) {
            setSaveMsg('Failed to update profile.')
        }
    }

    const handleConfirmSale = async (productId) => {
        try {
            await API.post(`/api/products/${productId}/confirm-sale`)
            fetchAll()
        } catch (err) {
            alert(err.response?.data || 'Failed to confirm sale')
        }
    }

    const handlePhotoClick = () => {
        fileInputRef.current?.click()
    }

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            setSaveMsg('Image size should be less than 10MB')
            setTimeout(() => setSaveMsg(''), 3000)
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        setSaveMsg('Uploading photo...')

        try {
            const res = await API.put('/api/users/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const photoUrl = res.data
            setProfile(prev => ({ ...prev, profilePhoto: photoUrl }))
            localStorage.setItem('profilePhoto', photoUrl)
            setSaveMsg('Photo updated! Refreshing...')
            // Give Cloudinary a moment to propagate
            setTimeout(() => {
                setSaveMsg('Profile photo updated successfully!')
                setTimeout(() => setSaveMsg(''), 3000)
            }, 1000)
        } catch (err) {
            setSaveMsg('Failed to upload photo.')
        } finally {
            setUploading(false)
        }
    }

    const getStatusClass = (status) => {
        if (status === 'ACTIVE') return 'profile-status-active'
        if (status === 'PENDING') return 'profile-status-pending'
        if (status === 'SOLD') return 'profile-status-sold'
        return 'profile-status-other'
    }

    if (loading) return (
        <div className="profile-page"><Navbar />
            <p className="profile-loading">Loading profile...</p>
        </div>
    )

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                {profile && !profile.mobile && (
                    <div className="profile-warning-banner">
                        ⚠️ <strong>Action Required:</strong> Please add your mobile number to enable bidding and buying features.
                    </div>
                )}

                {/* Profile Card */}
                <div className="profile-card">
                    <div 
                        className={`profile-avatar ${uploading ? 'uploading' : ''}`}
                        onClick={handlePhotoClick}
                        title="Click to change photo"
                    >
                        {profile?.profilePhoto ? (
                            <img src={profile.profilePhoto} alt={profile.name} className="profile-avatar-img" />
                        ) : (
                            profile?.name?.charAt(0).toUpperCase()
                        )}
                        <div className="profile-avatar-overlay">
                            <span>{uploading ? '...' : '📷'}</span>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />

                    <div className="profile-info">
                        {editing ? (
                            <div className="profile-edit-form">
                                <div className="profile-edit-row">
                                    <div className="profile-edit-field">
                                        <label className="profile-edit-label">Name</label>
                                        <input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="profile-edit-input"
                                        />
                                    </div>
                                    <div className="profile-edit-field">
                                        <label className="profile-edit-label">Mobile</label>
                                        <input
                                            value={form.mobile}
                                            onChange={e => setForm({ ...form, mobile: e.target.value })}
                                            className="profile-edit-input"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <div className="profile-edit-field">
                                        <label className="profile-edit-label">Location</label>
                                        <input
                                            value={form.location}
                                            onChange={e => setForm({ ...form, location: e.target.value })}
                                            className="profile-edit-input"
                                            placeholder="Hyderabad"
                                        />
                                    </div>
                                </div>
                                <div className="profile-edit-actions">
                                    <button onClick={handleSave} className="profile-save-btn">Save Changes</button>
                                    <button onClick={() => setEditing(false)} className="profile-cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="profile-name">{profile?.name}</h2>
                                <p className="profile-email">✉️ {profile?.email}</p>
                                {profile?.mobile && <p className="profile-meta">📱 {profile.mobile}</p>}
                                {profile?.location && <p className="profile-meta">📍 {profile.location}</p>}
                                <button onClick={() => setEditing(true)} className="profile-edit-btn">
                                    Edit Profile
                                </button>
                            </>
                        )}
                        {saveMsg && <p className="profile-save-msg">{saveMsg}</p>}
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <span className="profile-stat-num">{listedProducts.length}</span>
                            <span className="profile-stat-label">Listed</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-num">{wonProducts.length}</span>
                            <span className="profile-stat-label">Won / Bought</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-num">{myBids.length}</span>
                            <span className="profile-stat-label">Bids Placed</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    {[
                        { key: 'listed', label: 'My Listings' },
                        { key: 'won', label: 'Won / Bought' },
                        { key: 'bids', label: 'Bid History' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="profile-search-bar">
                    <div className="profile-search-inner">
                        <span className="profile-search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search your listings, wins, or bids..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="profile-search-input"
                        />
                        {searchTerm && (
                            <button className="profile-search-clear" onClick={() => setSearchTerm('')}>×</button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {/* My Listings */}
                    {activeTab === 'listed' && (
                        listedProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? <EmptyState text={searchTerm ? "No matching products found." : "You haven't listed any products yet."} /> : (
                            <div className="profile-list">
                                {listedProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                    <div key={p.productId} className="profile-item-card">
                                        {p.imagePath && <img src={p.imagePath} alt={p.name} className="profile-item-img" />}
                                        <div className="profile-item-info">
                                            <h3 className="profile-item-name">{p.name}</h3>
                                            <p className="profile-item-meta">
                                                ₹{p.currentPrice?.toLocaleString()} &nbsp;·&nbsp;
                                                <span className={getStatusClass(p.status)}>
                                                    {p.status}
                                                </span>
                                            </p>
                                            {p.status === 'PENDING' && (
                                                <button className="profile-confirm-btn" onClick={() => handleConfirmSale(p.productId)}>
                                                    Confirm Sale
                                                </button>
                                            )}
                                        </div>
                                        <button className="profile-view-btn" onClick={() => navigate(`/products/${p.productId}`)}>
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Won / Bought */}
                    {activeTab === 'won' && (
                        wonProducts.filter(p => 
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 ? <EmptyState text={searchTerm ? "No matching products found." : "You haven't won or bought any products yet."} /> : (
                            <div className="profile-list">
                                {wonProducts.filter(p => 
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    p.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(p => (
                                    <div key={p.productId} className="profile-item-card">
                                        {p.imagePath && <img src={p.imagePath} alt={p.name} className="profile-item-img" />}
                                        <div className="profile-item-info">
                                            <h3 className="profile-item-name">{p.name}</h3>
                                            <p className="profile-item-meta">
                                                ₹{p.currentPrice?.toLocaleString()} &nbsp;·&nbsp;
                                                <span style={{ color: '#111827', fontWeight: 500 }}>{p.saleType}</span>
                                            </p>
                                        </div>
                                        <button className="profile-view-btn" onClick={() => navigate(`/products/${p.productId}`)}>
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Bid History */}
                    {activeTab === 'bids' && (
                        myBids.filter(b => b.productName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? <EmptyState text={searchTerm ? "No matching bids found." : "You haven't placed any bids yet."} /> : (
                            <div className="profile-list">
                                {myBids.filter(b => b.productName.toLowerCase().includes(searchTerm.toLowerCase())).map(bid => (
                                    <div key={bid.bidId} className="profile-bid-card">
                                        <div>
                                            <p className="profile-item-name">{bid.productName}</p>
                                            <p className="profile-bid-time">{new Date(bid.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="profile-bid-right">
                                            <span className="profile-bid-amount">₹{bid.bidAmount?.toLocaleString()}</span>
                                            <button className="profile-view-btn" onClick={() => navigate(`/products/${bid.productId}`)}>
                                                View →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

function EmptyState({ text }) {
    return (
        <div className="profile-empty-state">
            <p className="profile-empty-text">{text}</p>
        </div>
    )
}

export default Profile