import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'

function Products() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [unavailable, setUnavailable] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All')

    useEffect(() => {
        Promise.all([
            API.get('/api/products'),
            API.get('/api/products/unavailable'),
        ])
            .then(([activeRes, unavailableRes]) => {
                setProducts(activeRes.data)
                setUnavailable(unavailableRes.data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const auctions = products.filter(p => p.saleType === 'AUCTION')
    const directSale = products.filter(p => p.saleType === 'DIRECT')
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]

    const filteredAuctions = selectedCategory === 'All' ? auctions : auctions.filter(p => p.category === selectedCategory)
    const filteredDirect = selectedCategory === 'All' ? directSale : directSale.filter(p => p.category === selectedCategory)

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                {loading ? (
                    <div style={styles.loadingBox}>
                        <p style={styles.loadingText}>Loading products...</p>
                    </div>
                ) : (
                    <>
                        {/* Category Filter */}
                        {categories.length > 1 && (
                            <div style={styles.categoryBar}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        style={{
                                            ...styles.catBtn,
                                            ...(selectedCategory === cat ? styles.catBtnActive : {})
                                        }}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Live Auctions */}
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>Live Auctions</h2>
                                    <p style={styles.sectionSubtitle}>Place bids and win products at the best price</p>
                                </div>
                                <span style={styles.countBadge}>{filteredAuctions.length} active</span>
                            </div>
                            {filteredAuctions.length === 0 ? (
                                <EmptyBox text="No active auctions in this category." />
                            ) : (
                                <div style={styles.grid}>
                                    {filteredAuctions.map(p => (
                                        <ProductCard key={p.productId} product={p} onClick={() => navigate(`/products/${p.productId}`)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        <div style={styles.divider} />

                        {/* Buy Now */}
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>Buy Now</h2>
                                    <p style={styles.sectionSubtitle}>Purchase products instantly at a fixed price</p>
                                </div>
                                <span style={{ ...styles.countBadge, backgroundColor: '#71360015', color: '#713600' }}>
                                    {filteredDirect.length} available
                                </span>
                            </div>
                            {filteredDirect.length === 0 ? (
                                <EmptyBox text="No direct sale products in this category." />
                            ) : (
                                <div style={styles.grid}>
                                    {filteredDirect.map(p => (
                                        <ProductCard key={p.productId} product={p} onClick={() => navigate(`/products/${p.productId}`)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Unavailable */}
                        {unavailable.length > 0 && (
                            <>
                                <div style={styles.divider} />
                                <section style={styles.section}>
                                    <div style={styles.sectionHeader}>
                                        <div>
                                            <h2 style={{ ...styles.sectionTitle, color: '#9a7a5a' }}>No Longer Available</h2>
                                            <p style={styles.sectionSubtitle}>These products have been sold, pending or expired</p>
                                        </div>
                                        <span style={{ ...styles.countBadge, backgroundColor: '#9a7a5a15', color: '#9a7a5a' }}>
                                            {unavailable.length} items
                                        </span>
                                    </div>
                                    <div style={styles.grid}>
                                        {unavailable.map(p => (
                                            <ProductCard key={p.productId} product={p} onClick={() => navigate(`/products/${p.productId}`)} unavailable />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function ProductCard({ product, onClick, unavailable = false }) {
    const isAuction = product.saleType === 'AUCTION'

    return (
        <div style={{ ...styles.card, opacity: unavailable ? 0.65 : 1 }} onClick={onClick}>
            {/* Image */}
            {product.imagePath ? (
                <div style={styles.imageBox}>
                    <img src={product.imagePath} alt={product.name} style={styles.image} />
                    <span style={{
                        ...styles.badge,
                        backgroundColor: unavailable ? '#9a7a5a22' : isAuction ? '#C0580022' : '#71360022',
                        color: unavailable ? '#9a7a5a' : isAuction ? '#C05800' : '#713600',
                        border: `0.5px solid ${unavailable ? '#9a7a5a55' : isAuction ? '#C0580055' : '#71360055'}`,
                    }}>
                        {unavailable ? product.status : isAuction ? 'AUCTION' : 'BUY NOW'}
                    </span>
                </div>
            ) : (
                <div style={styles.noImageBox}>
                    <div style={styles.noImageInner}>
                        <span style={styles.noImageIcon}>{isAuction ? '🔨' : '🛍️'}</span>
                        <span style={{
                            ...styles.badge,
                            ...styles.badgeNoImg,
                            backgroundColor: unavailable ? '#9a7a5a22' : isAuction ? '#C0580022' : '#71360022',
                            color: unavailable ? '#9a7a5a' : isAuction ? '#C05800' : '#713600',
                            border: `0.5px solid ${unavailable ? '#9a7a5a55' : isAuction ? '#C0580055' : '#71360055'}`,
                        }}>
                            {unavailable ? product.status : isAuction ? 'AUCTION' : 'BUY NOW'}
                        </span>
                    </div>
                </div>
            )}

            {/* Body */}
            <div style={styles.cardBody}>
                <div style={styles.cardTopRow}>
                    <h3 style={styles.cardTitle}>{product.name}</h3>
                    {product.brand && <p style={styles.cardBrand}>{product.brand}</p>}
                </div>

                <div style={styles.cardMeta}>
                    {product.category && <span style={styles.metaChip}>{product.category}</span>}
                    {product.location && <span style={styles.metaChip}>📍 {product.location}</span>}
                    {product.productCondition && <span style={styles.metaChip}>{product.productCondition}</span>}
                </div>

                <div style={styles.cardFooter}>
                    <div>
                        <p style={styles.priceLabel}>{isAuction ? 'Current Bid' : 'Price'}</p>
                        <p style={styles.price}>₹{product.currentPrice?.toLocaleString()}</p>
                    </div>
                    {isAuction && product.auctionEndTime && !unavailable && (
                        <div style={{ textAlign: 'right' }}>
                            <p style={styles.priceLabel}>Ends</p>
                            <p style={styles.endValue}>{new Date(product.auctionEndTime).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>

                {!unavailable && (
                    <button style={{
                        ...styles.cardButton,
                        backgroundColor: isAuction ? '#C05800' : '#713600',
                    }}>
                        {isAuction ? 'Place Bid' : 'Buy Now'}
                    </button>
                )}
            </div>
        </div>
    )
}

function EmptyBox({ text }) {
    return (
        <div style={styles.emptyBox}>
            <p style={styles.emptyText}>{text}</p>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#f7f4ec', minHeight: '100vh' },
    container: { padding: '36px 48px' },
    loadingBox: { textAlign: 'center', padding: '80px 0' },
    loadingText: { color: '#9a7a5a', fontSize: '15px' },
    categoryBar: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' },
    catBtn: {
        padding: '6px 16px', borderRadius: '20px',
        border: '0.5px solid #d4c8b0', backgroundColor: '#fff',
        color: '#9a7a5a', fontSize: '13px', cursor: 'pointer',
    },
    catBtnActive: {
        backgroundColor: '#38240D', color: '#FDFBD4',
        border: '0.5px solid #38240D',
    },
    section: { marginBottom: '16px' },
    sectionHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: '20px',
    },
    sectionTitle: { color: '#38240D', fontSize: '20px', fontWeight: '500', margin: '0 0 4px 0' },
    sectionSubtitle: { color: '#9a7a5a', fontSize: '13px', margin: 0 },
    countBadge: {
        backgroundColor: '#C0580015', color: '#C05800',
        padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
    },
    emptyBox: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '36px', textAlign: 'center',
        border: '0.5px dashed #d4c8b0',
    },
    emptyText: { color: '#9a7a5a', margin: 0, fontSize: '14px' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
    },
    divider: { height: '0.5px', backgroundColor: '#e0d8c8', margin: '36px 0' },
    card: {
        backgroundColor: '#fff', borderRadius: '12px',
        overflow: 'hidden', border: '0.5px solid #e8e0d0',
        cursor: 'pointer', transition: 'border-color 0.2s',
    },
    imageBox: { position: 'relative', height: '160px' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    badge: {
        position: 'absolute', top: '10px', left: '10px',
        padding: '3px 9px', borderRadius: '20px',
        fontSize: '10px', fontWeight: '600', letterSpacing: '0.3px',
    },
    noImageBox: {
        height: '80px', backgroundColor: '#FDFBD4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    noImageInner: {
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    noImageIcon: { fontSize: '20px' },
    badgeNoImg: { position: 'static' },
    cardBody: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' },
    cardTopRow: {},
    cardTitle: { color: '#38240D', fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' },
    cardBrand: { color: '#9a7a5a', fontSize: '12px', margin: 0 },
    cardMeta: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    metaChip: {
        backgroundColor: '#f5f0e8', color: '#713600',
        padding: '2px 8px', borderRadius: '20px', fontSize: '11px',
    },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceLabel: { color: '#9a7a5a', fontSize: '11px', margin: '0 0 2px 0' },
    price: { color: '#C05800', fontWeight: '500', fontSize: '18px', margin: 0 },
    endValue: { color: '#713600', fontSize: '12px', margin: 0 },
    cardButton: {
        width: '100%', padding: '9px', color: '#FDFBD4',
        border: 'none', borderRadius: '7px',
        fontSize: '13px', cursor: 'pointer', marginTop: '2px',
    },
}

export default Products