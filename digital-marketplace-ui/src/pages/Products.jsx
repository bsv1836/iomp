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

    // Get all unique categories from active products
    const categories = ['All', ...new Set(products
        .map(p => p.category)
        .filter(Boolean))]

    // Filter by selected category
    const filteredAuctions = selectedCategory === 'All'
        ? auctions
        : auctions.filter(p => p.category === selectedCategory)

    const filteredDirect = selectedCategory === 'All'
        ? directSale
        : directSale.filter(p => p.category === selectedCategory)

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
                        {/* ── Category Filter ── */}
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

                        {/* ── Auctions Section ── */}
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>🔨 Live Auctions</h2>
                                    <p style={styles.sectionSubtitle}>
                                        Place bids and win products at the best price
                                    </p>
                                </div>
                                <span style={styles.countBadge}>
                  {filteredAuctions.length} active
                </span>
                            </div>

                            {filteredAuctions.length === 0 ? (
                                <div style={styles.emptyBox}>
                                    <p style={styles.emptyText}>No active auctions in this category.</p>
                                </div>
                            ) : (
                                <div style={styles.grid}>
                                    {filteredAuctions.map(product => (
                                        <ProductCard
                                            key={product.productId}
                                            product={product}
                                            onClick={() => navigate(`/products/${product.productId}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <div style={styles.divider} />

                        {/* ── Direct Sale Section ── */}
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>🛍️ Buy Now</h2>
                                    <p style={styles.sectionSubtitle}>
                                        Purchase products instantly at a fixed price
                                    </p>
                                </div>
                                <span style={{
                                    ...styles.countBadge,
                                    backgroundColor: '#00b09b22',
                                    color: '#00b09b'
                                }}>
                  {filteredDirect.length} available
                </span>
                            </div>

                            {filteredDirect.length === 0 ? (
                                <div style={styles.emptyBox}>
                                    <p style={styles.emptyText}>No direct sale products in this category.</p>
                                </div>
                            ) : (
                                <div style={styles.grid}>
                                    {filteredDirect.map(product => (
                                        <ProductCard
                                            key={product.productId}
                                            product={product}
                                            onClick={() => navigate(`/products/${product.productId}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ── Unavailable Products ── */}
                        {unavailable.length > 0 && (
                            <>
                                <div style={styles.divider} />
                                <section style={styles.section}>
                                    <div style={styles.sectionHeader}>
                                        <div>
                                            <h2 style={{ ...styles.sectionTitle, color: '#8888aa' }}>
                                                ⛔ Products No Longer Available
                                            </h2>
                                            <p style={styles.sectionSubtitle}>
                                                These products have been sold or expired
                                            </p>
                                        </div>
                                        <span style={{
                                            ...styles.countBadge,
                                            backgroundColor: '#8888aa22',
                                            color: '#8888aa'
                                        }}>
                      {unavailable.length} items
                    </span>
                                    </div>
                                    <div style={styles.grid}>
                                        {unavailable.map(product => (
                                            <ProductCard
                                                key={product.productId}
                                                product={product}
                                                onClick={() => navigate(`/products/${product.productId}`)}
                                                unavailable
                                            />
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
        <div
            style={{
                ...styles.card,
                opacity: unavailable ? 0.6 : 1,
                cursor: 'pointer',
            }}
            onClick={onClick}
        >
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
                    backgroundColor: unavailable ? '#8888aa22' :
                        isAuction ? '#e9456022' : '#00b09b22',
                    color: unavailable ? '#8888aa' :
                        isAuction ? '#e94560' : '#00b09b',
                }}>
          {unavailable ? product.status :
              isAuction ? 'AUCTION' : 'BUY NOW'}
        </span>
            </div>

            {/* Details */}
            <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{product.name}</h3>
                {product.brand && <p style={styles.cardBrand}>{product.brand}</p>}
                {product.category && (
                    <span style={styles.categoryChip}>{product.category}</span>
                )}
                <p style={styles.cardDesc}>
                    {product.description?.slice(0, 70)}
                    {product.description?.length > 70 ? '...' : ''}
                </p>
                <div style={styles.cardMeta}>
                    {product.location && (
                        <span style={styles.metaItem}>📍 {product.location}</span>
                    )}
                    {product.purchaseYear && (
                        <span style={styles.metaItem}>📅 {product.purchaseYear}</span>
                    )}
                </div>
                <div style={styles.cardFooter}>
                    <div>
                        <p style={styles.priceLabel}>
                            {isAuction ? 'Current Bid' : 'Price'}
                        </p>
                        <p style={styles.price}>
                            ₹{product.currentPrice?.toLocaleString()}
                        </p>
                    </div>
                    {isAuction && product.auctionEndTime && !unavailable && (
                        <div style={styles.endTime}>
                            <p style={styles.endLabel}>Ends</p>
                            <p style={styles.endValue}>
                                {new Date(product.auctionEndTime).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
                {!unavailable && (
                    <button style={{
                        ...styles.cardButton,
                        backgroundColor: isAuction ? '#e94560' : '#00b09b',
                    }}>
                        {isAuction ? '🔨 Place Bid' : '🛍️ Buy Now'}
                    </button>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#0a0a15', minHeight: '100vh' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
    loadingBox: { textAlign: 'center', padding: '80px 0' },
    loadingText: { color: '#8888aa', fontSize: '16px' },
    categoryBar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '32px',
    },
    catBtn: {
        padding: '7px 16px',
        borderRadius: '20px',
        border: '1px solid #2a2a4a',
        backgroundColor: 'transparent',
        color: '#8888aa',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    catBtnActive: {
        backgroundColor: '#e94560',
        color: 'white',
        border: '1px solid #e94560',
    },
    section: { marginBottom: '16px' },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
    },
    sectionTitle: { color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' },
    sectionSubtitle: { color: '#8888aa', fontSize: '14px', margin: 0 },
    countBadge: {
        backgroundColor: '#e9456022',
        color: '#e94560',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
    },
    emptyBox: {
        backgroundColor: '#12121f', borderRadius: '12px',
        padding: '40px', textAlign: 'center',
        border: '1px dashed #2a2a4a',
    },
    emptyText: { color: '#8888aa', margin: 0 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    divider: { height: '1px', backgroundColor: '#1e1e3a', margin: '40px 0' },
    card: {
        backgroundColor: '#12121f', borderRadius: '14px',
        overflow: 'hidden', border: '1px solid #1e1e3a',
    },
    imageBox: { position: 'relative', height: '180px', backgroundColor: '#1a1a2e' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: {
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '48px',
    },
    badge: {
        position: 'absolute', top: '12px', left: '12px',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
    },
    cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
    cardTitle: { color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 },
    cardBrand: { color: '#8888aa', fontSize: '13px', margin: 0 },
    categoryChip: {
        display: 'inline-block',
        backgroundColor: '#1e1e3a',
        color: '#aaaacc',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        width: 'fit-content',
    },
    cardDesc: { color: '#8888aa', fontSize: '13px', lineHeight: '1.5', margin: 0 },
    cardMeta: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    metaItem: { color: '#666688', fontSize: '12px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceLabel: { color: '#8888aa', fontSize: '11px', margin: '0 0 2px 0' },
    price: { color: '#e94560', fontWeight: '700', fontSize: '20px', margin: 0 },
    endTime: { textAlign: 'right' },
    endLabel: { color: '#8888aa', fontSize: '11px', margin: '0 0 2px 0' },
    endValue: { color: '#ffa500', fontSize: '13px', margin: 0 },
    cardButton: {
        width: '100%', padding: '10px', color: 'white',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px',
    },
}

export default Products