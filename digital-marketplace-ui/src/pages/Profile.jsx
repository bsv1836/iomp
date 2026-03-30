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

                {/* Profile Card */}
                <div style={styles.profileCard}>
                    <div style={styles.avatar}>
                        {profile?.name?.charAt(0).toUpperCase()}
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
                                    Edit Profile
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
                            <span style={styles.statLabel}>Won / Bought</span>
                        </div>
                        <div style={styles.stat}>
                            <span style={styles.statNum}>{myBids.length}</span>
                            <span style={styles.statLabel}>Bids Placed</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[
                        { key: 'listed', label: 'My Listings' },
                        { key: 'won', label: 'Won / Bought' },
                        { key: 'bids', label: 'Bid History' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.activeTab : {}) }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {/* My Listings */}
                    {activeTab === 'listed' && (
                        listedProducts.length === 0 ? <EmptyState text="You haven't listed any products yet." /> : (
                            <div style={styles.list}>
                                {listedProducts.map(p => (
                                    <div key={p.productId} style={styles.itemCard}>
                                        {p.imagePath && <img src={p.imagePath} alt={p.name} style={styles.itemImg} />}
                                        <div style={styles.itemInfo}>
                                            <h3 style={styles.itemName}>{p.name}</h3>
                                            <p style={styles.itemMeta}>
                                                ₹{p.currentPrice?.toLocaleString()} &nbsp;·&nbsp;
                                                <span style={{
                                                    color: p.status === 'ACTIVE' ? '#3a7a3a' :
                                                        p.status === 'PENDING' ? '#C05800' :
                                                            p.status === 'SOLD' ? '#713600' : '#9a7a5a'
                                                }}>
                                                    {p.status}
                                                </span>
                                            </p>
                                            {p.status === 'PENDING' && (
                                                <button style={styles.confirmBtn} onClick={() => handleConfirmSale(p.productId)}>
                                                    Confirm Sale
                                                </button>
                                            )}
                                        </div>
                                        <button style={styles.viewBtn} onClick={() => navigate(`/products/${p.productId}`)}>
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Won / Bought */}
                    {activeTab === 'won' && (
                        wonProducts.length === 0 ? <EmptyState text="You haven't won or bought any products yet." /> : (
                            <div style={styles.list}>
                                {wonProducts.map(p => (
                                    <div key={p.productId} style={styles.itemCard}>
                                        {p.imagePath && <img src={p.imagePath} alt={p.name} style={styles.itemImg} />}
                                        <div style={styles.itemInfo}>
                                            <h3 style={styles.itemName}>{p.name}</h3>
                                            <p style={styles.itemMeta}>
                                                ₹{p.currentPrice?.toLocaleString()} &nbsp;·&nbsp;
                                                <span style={{ color: '#C05800' }}>{p.saleType}</span>
                                            </p>
                                        </div>
                                        <button style={styles.viewBtn} onClick={() => navigate(`/products/${p.productId}`)}>
                                            View →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Bid History */}
                    {activeTab === 'bids' && (
                        myBids.length === 0 ? <EmptyState text="You haven't placed any bids yet." /> : (
                            <div style={styles.list}>
                                {myBids.map(bid => (
                                    <div key={bid.bidId} style={styles.bidCard}>
                                        <div>
                                            <p style={styles.itemName}>{bid.productName}</p>
                                            <p style={styles.bidTime}>{new Date(bid.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div style={styles.bidRight}>
                                            <span style={styles.bidAmount}>₹{bid.bidAmount?.toLocaleString()}</span>
                                            <button style={styles.viewBtn} onClick={() => navigate(`/products/${bid.productId}`)}>
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
            textAlign: 'center', padding: '48px 20px',
            backgroundColor: '#fff', borderRadius: '12px',
            border: '0.5px dashed #d4c8b0',
        }}>
            <p style={{ color: '#9a7a5a', margin: 0, fontSize: '14px' }}>{text}</p>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#f7f4ec', minHeight: '100vh' },
    container: { padding: '36px 48px' },
    loading: { color: '#9a7a5a', padding: '40px', textAlign: 'center' },
    profileCard: {
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '28px', border: '0.5px solid #e8e0d0',
        display: 'flex', alignItems: 'center',
        gap: '24px', marginBottom: '28px', flexWrap: 'wrap',
    },
    avatar: {
        width: '68px', height: '68px', borderRadius: '50%',
        backgroundColor: '#38240D', color: '#FDFBD4',
        fontSize: '26px', fontWeight: '500',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    profileInfo: { flex: 1, minWidth: '200px' },
    profileName: { color: '#38240D', fontSize: '20px', fontWeight: '500', margin: '0 0 6px 0' },
    profileEmail: { color: '#9a7a5a', fontSize: '13px', margin: '0 0 4px 0' },
    profileMeta: { color: '#713600', fontSize: '13px', margin: '0 0 4px 0' },
    editBtn: {
        marginTop: '10px', backgroundColor: 'transparent',
        color: '#C05800', border: '0.5px solid #C0580044',
        padding: '6px 14px', borderRadius: '6px',
        fontSize: '13px', cursor: 'pointer',
    },
    editForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
    editRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    editField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' },
    editLabel: { color: '#713600', fontSize: '12px' },
    editInput: {
        padding: '8px 12px', borderRadius: '6px',
        border: '0.5px solid #d4c8b0', backgroundColor: '#faf9f5',
        color: '#38240D', fontSize: '14px', outline: 'none',
    },
    editActions: { display: 'flex', gap: '10px' },
    saveBtn: {
        padding: '8px 18px', backgroundColor: '#C05800',
        color: '#FDFBD4', border: 'none', borderRadius: '6px',
        fontSize: '13px', cursor: 'pointer',
    },
    cancelBtn: {
        padding: '8px 18px', backgroundColor: 'transparent',
        color: '#9a7a5a', border: '0.5px solid #d4c8b0',
        borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
    },
    saveMsg: { color: '#3a7a3a', fontSize: '13px', margin: '8px 0 0 0' },
    stats: { display: 'flex', gap: '32px', marginLeft: 'auto' },
    stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    statNum: { color: '#C05800', fontSize: '24px', fontWeight: '500' },
    statLabel: { color: '#9a7a5a', fontSize: '12px' },
    tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
    tab: {
        padding: '9px 20px', backgroundColor: '#fff',
        color: '#9a7a5a', border: '0.5px solid #e8e0d0',
        borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
    },
    activeTab: {
        backgroundColor: '#38240D', color: '#FDFBD4',
        border: '0.5px solid #38240D',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    itemCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '14px 18px', border: '0.5px solid #e8e0d0',
        display: 'flex', alignItems: 'center', gap: '14px',
    },
    itemImg: { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
    itemInfo: { flex: 1 },
    itemName: { color: '#38240D', fontSize: '14px', fontWeight: '500', margin: '0 0 4px 0' },
    itemMeta: { color: '#9a7a5a', fontSize: '13px', margin: '0 0 6px 0' },
    confirmBtn: {
        padding: '5px 12px', backgroundColor: '#C05800',
        color: '#FDFBD4', border: 'none', borderRadius: '6px',
        fontSize: '12px', cursor: 'pointer',
    },
    viewBtn: {
        padding: '6px 14px', backgroundColor: 'transparent',
        color: '#C05800', border: '0.5px solid #C0580044',
        borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
        flexShrink: 0,
    },
    bidCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '14px 18px', border: '0.5px solid #e8e0d0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    bidTime: { color: '#9a7a5a', fontSize: '12px', margin: 0 },
    bidRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    bidAmount: { color: '#C05800', fontSize: '18px', fontWeight: '500' },
}

export default Profile