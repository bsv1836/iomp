import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'

function Profile() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [listedProducts, setListedProducts] = useState([])
    const [wonProducts, setWonProducts] = useState([])
    const [myBids, setMyBids] = useState([])
    const [activeTab, setActiveTab] = useState('listed')
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saveMsg, setSaveMsg] = useState('')

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

    if (loading) return (
        <div style={styles.page}><Navbar />
            <p style={styles.loading}>Loading profile...</p>
        </div>
    )

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>

                {/* ── Profile Card ── */}
                <div style={styles.profileCard}>
                    <div style={styles.avatarBox}>
                        <div style={styles.avatar}>
                            {profile?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div style={styles.profileInfo}>
                        {editing ? (
                            <div style={styles.editForm}>
                                <div style={styles.editRow}>
                                    <div style={styles.editField}>
                                        <label style={styles.editLabel}>Name</label>
                                        <input
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            style={styles.editInput}
                                        />
                                    </div>
                                    <div style={styles.editField}>
                                        <label style={styles.editLabel}>Mobile</label>
                                        <input
                                            value={form.mobile}
                                            onChange={e => setForm({ ...form, mobile: e.target.value })}
                                            style={styles.editInput}
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <div style={styles.editField}>
                                        <label style={styles.editLabel}>Location</label>
                                        <input
                                            value={form.location}
                                            onChange={e => setForm({ ...form, location: e.target.value })}
                                            style={styles.editInput}
                                            placeholder="Hyderabad"
                                        />
                                    </div>
                                </div>
                                <div style={styles.editActions}>
                                    <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
                                    <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={styles.profileName}>{profile?.name}</h2>
                                <p style={styles.profileEmail}>✉️ {profile?.email}</p>
                                {profile?.mobile && <p style={styles.profileMeta}>📱 {profile.mobile}</p>}
                                {profile?.location && <p style={styles.profileMeta}>📍 {profile.location}</p>}
                                <button onClick={() => setEditing(true)} style={styles.editBtn}>
                                    ✏️ Edit Profile
                                </button>
                            </>
                        )}
                        {saveMsg && <p style={styles.saveMsg}>{saveMsg}</p>}
                    </div>

                    {/* Stats */}
                    <div style={styles.stats}>
                        <div style={styles.stat}>
                            <span style={styles.statNum}>{listedProducts.length}</span>
                            <span style={styles.statLabel}>Listed</span>
                        </div>
                        <div style={styles.stat}>
                            <span style={styles.statNum}>{wonProducts.length}</span>
                            <span style={styles.statLabel}>Won/Bought</span>
                        </div>
                        <div style={styles.stat}>
                            <span style={styles.statNum}>{myBids.length}</span>
                            <span style={styles.statLabel}>Bids Placed</span>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={styles.tabs}>
                    {[
                        { key: 'listed', label: '📦 My Listings' },
                        { key: 'won', label: '🏆 Won / Bought' },
                        { key: 'bids', label: '🔨 Bid History' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.key ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div style={styles.tabContent}>

                    {/* My Listings */}
                    {activeTab === 'listed' && (
                        listedProducts.length === 0 ? (
                            <EmptyState text="You haven't listed any products yet." />
                        ) : (
                            <div style={styles.productList}>
                                {listedProducts.map(p => (
                                    <div key={p.productId} style={styles.productCard}>
                                        {p.imagePath && (
                                            <img src={p.imagePath} alt={p.name} style={styles.productImg} />
                                        )}
                                        <div style={styles.productInfo}>
                                            <h3 style={styles.productName}>{p.name}</h3>
                                            <p style={styles.productMeta}>
                                                ₹{p.currentPrice?.toLocaleString()} •
                                                <span style={{
                                                    color: p.status === 'ACTIVE' ? '#00b09b' :
                                                        p.status === 'PENDING' ? '#ffa500' :
                                                            p.status === 'SOLD' ? '#e94560' : '#8888aa'
                                                }}> {p.status}</span>
                                            </p>
                                            {p.status === 'PENDING' && (
                                                <button
                                                    style={styles.confirmBtn}
                                                    onClick={() => handleConfirmSale(p.productId)}
                                                >
                                                    ✅ Confirm Sale
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => navigate(`/products/${p.productId}`)}
                                        >
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Won / Bought */}
                    {activeTab === 'won' && (
                        wonProducts.length === 0 ? (
                            <EmptyState text="You haven't won or bought any products yet." />
                        ) : (
                            <div style={styles.productList}>
                                {wonProducts.map(p => (
                                    <div key={p.productId} style={styles.productCard}>
                                        {p.imagePath && (
                                            <img src={p.imagePath} alt={p.name} style={styles.productImg} />
                                        )}
                                        <div style={styles.productInfo}>
                                            <h3 style={styles.productName}>{p.name}</h3>
                                            <p style={styles.productMeta}>
                                                ₹{p.currentPrice?.toLocaleString()} •
                                                <span style={{ color: '#e94560' }}> {p.saleType}</span>
                                            </p>
                                        </div>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => navigate(`/products/${p.productId}`)}
                                        >
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Bid History */}
                    {activeTab === 'bids' && (
                        myBids.length === 0 ? (
                            <EmptyState text="You haven't placed any bids yet." />
                        ) : (
                            <div style={styles.bidList}>
                                {myBids.map(bid => (
                                    <div key={bid.bidId} style={styles.bidCard}>
                                        <div>
                                            <p style={styles.bidProduct}>{bid.productName}</p>
                                            <p style={styles.bidTime}>
                                                {new Date(bid.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={styles.bidRight}>
                      <span style={styles.bidAmount}>
                        ₹{bid.bidAmount?.toLocaleString()}
                      </span>
                                            <button
                                                style={styles.viewBtn}
                                                onClick={() => navigate(`/products/${bid.productId}`)}
                                            >
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
        </div>
    )
}

function EmptyState({ text }) {
    return (
        <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: '#12121f', borderRadius: '12px',
            border: '1px dashed #2a2a4a',
        }}>
            <p style={{ color: '#8888aa', margin: 0 }}>{text}</p>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#0a0a15', minHeight: '100vh' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
    loading: { color: '#8888aa', padding: '40px', textAlign: 'center' },
    profileCard: {
        backgroundColor: '#12121f',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid #1e1e3a',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        marginBottom: '28px',
        flexWrap: 'wrap',
    },
    avatarBox: { flexShrink: 0 },
    avatar: {
        width: '72px', height: '72px',
        borderRadius: '50%',
        backgroundColor: '#e94560',
        color: 'white',
        fontSize: '28px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    profileInfo: { flex: 1, minWidth: '200px' },
    profileName: { color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 6px 0' },
    profileEmail: { color: '#8888aa', fontSize: '14px', margin: '0 0 4px 0' },
    profileMeta: { color: '#aaaacc', fontSize: '14px', margin: '0 0 4px 0' },
    editBtn: {
        marginTop: '12px',
        backgroundColor: 'transparent',
        color: '#e94560',
        border: '1px solid #e9456044',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
    },
    editForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
    editRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    editField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' },
    editLabel: { color: '#8888aa', fontSize: '12px' },
    editInput: {
        padding: '8px 12px', borderRadius: '6px',
        border: '1px solid #2a2a4a', backgroundColor: '#0a0a15',
        color: 'white', fontSize: '14px', outline: 'none',
    },
    editActions: { display: 'flex', gap: '10px' },
    saveBtn: {
        padding: '8px 18px', backgroundColor: '#e94560',
        color: 'white', border: 'none', borderRadius: '6px',
        fontSize: '13px', cursor: 'pointer',
    },
    cancelBtn: {
        padding: '8px 18px', backgroundColor: 'transparent',
        color: '#8888aa', border: '1px solid #2a2a4a',
        borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
    },
    saveMsg: { color: '#00b09b', fontSize: '13px', margin: '8px 0 0 0' },
    stats: { display: 'flex', gap: '24px', marginLeft: 'auto' },
    stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    statNum: { color: '#e94560', fontSize: '24px', fontWeight: '700' },
    statLabel: { color: '#8888aa', fontSize: '12px' },
    tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
    tab: {
        padding: '10px 20px', backgroundColor: 'transparent',
        color: '#8888aa', border: '1px solid #1e1e3a',
        borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    },
    activeTab: { backgroundColor: '#e94560', color: 'white', border: '1px solid #e94560' },
    tabContent: {},
    productList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    productCard: {
        backgroundColor: '#12121f', borderRadius: '12px',
        padding: '16px 20px', border: '1px solid #1e1e3a',
        display: 'flex', alignItems: 'center', gap: '16px',
    },
    productImg: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
    productInfo: { flex: 1 },
    productName: { color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' },
    productMeta: { color: '#8888aa', fontSize: '13px', margin: '0 0 8px 0' },
    confirmBtn: {
        padding: '6px 14px', backgroundColor: '#00b09b',
        color: 'white', border: 'none', borderRadius: '6px',
        fontSize: '13px', cursor: 'pointer', fontWeight: '600',
    },
    viewBtn: {
        padding: '7px 14px', backgroundColor: 'transparent',
        color: '#e94560', border: '1px solid #e9456044',
        borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
    },
    bidList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    bidCard: {
        backgroundColor: '#12121f', borderRadius: '12px',
        padding: '16px 20px', border: '1px solid #1e1e3a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    bidProduct: { color: 'white', fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' },
    bidTime: { color: '#8888aa', fontSize: '12px', margin: 0 },
    bidRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    bidAmount: { color: '#e94560', fontSize: '18px', fontWeight: '700' },
}

export default Profile