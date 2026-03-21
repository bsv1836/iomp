import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'

function Products() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        API.get('/api/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const auctions = products.filter(p => p.saleType === 'AUCTION')
    const directSale = products.filter(p => p.saleType === 'DIRECT')

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
                        {/* ── Auctions Section ── */}
                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>🔨 Live Auctions</h2>
                                    <p style={styles.sectionSubtitle}>
                                        Place bids and win products at the best price
                                    </p>
                                </div>
                                <span style={styles.countBadge}>{auctions.length} active</span>
                            </div>

                            {auctions.length === 0 ? (
                                <div style={styles.emptyBox}>
                                    <p style={styles.emptyText}>No active auctions right now.</p>
                                </div>
                            ) : (
                                <div style={styles.grid}>
                                    {auctions.map(product => (
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
                  {directSale.length} available
                </span>
                            </div>

                            {directSale.length === 0 ? (
                                <div style={styles.emptyBox}>
                                    <p style={styles.emptyText}>No direct sale products right now.</p>
                                </div>
                            ) : (
                                <div style={styles.grid}>
                                    {directSale.map(product => (
                                        <ProductCard
                                            key={product.productId}
                                            product={product}
                                            onClick={() => navigate(`/products/${product.productId}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

function ProductCard({ product, onClick }) {
    const isAuction = product.saleType === 'AUCTION'

    return (
        <div style={styles.card} onClick={onClick}>
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
          {isAuction ? 'AUCTION' : 'BUY NOW'}
        </span>
            </div>

            {/* Details */}
            <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{product.name}</h3>
                {product.brand && (
                    <p style={styles.cardBrand}>{product.brand}</p>
                )}
                <p style={styles.cardDesc}>
                    {product.description?.slice(0, 80)}
                    {product.description?.length > 80 ? '...' : ''}
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
                        <p style={styles.price}>₹{product.currentPrice?.toLocaleString()}</p>
                    </div>
                    {isAuction && (
                        <div style={styles.endTime}>
                            <p style={styles.endLabel}>Ends</p>
                            <p style={styles.endValue}>
                                {new Date(product.auctionEndTime).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                <button style={{
                    ...styles.cardButton,
                    backgroundColor: isAuction ? '#e94560' : '#00b09b',
                }}>
                    {isAuction ? '🔨 Place Bid' : '🛍️ Buy Now'}
                </button>
            </div>
        </div>
    )
}

const styles = {
    page: { backgroundColor: '#0a0a15', minHeight: '100vh' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
    loadingBox: { textAlign: 'center', padding: '80px 0' },
    loadingText: { color: '#8888aa', fontSize: '16px' },
    section: { marginBottom: '16px' },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
    },
    sectionTitle: {
        color: 'white',
        fontSize: '22px',
        fontWeight: '700',
        margin: '0 0 4px 0',
    },
    sectionSubtitle: {
        color: '#8888aa',
        fontSize: '14px',
        margin: 0,
    },
    countBadge: {
        backgroundColor: '#e9456022',
        color: '#e94560',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
    },
    emptyBox: {
        backgroundColor: '#12121f',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        border: '1px dashed #2a2a4a',
    },
    emptyText: { color: '#8888aa', margin: 0 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    divider: {
        height: '1px',
        backgroundColor: '#1e1e3a',
        margin: '40px 0',
    },
    card: {
        backgroundColor: '#12121f',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #1e1e3a',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
    },
    imageBox: {
        position: 'relative',
        height: '180px',
        backgroundColor: '#1a1a2e',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        backgroundColor: '#1a1a2e',
    },
    badge: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    },
    cardBody: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    cardTitle: {
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
        margin: 0,
    },
    cardBrand: {
        color: '#8888aa',
        fontSize: '13px',
        margin: 0,
    },
    cardDesc: {
        color: '#8888aa',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: 0,
    },
    cardMeta: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    metaItem: {
        color: '#666688',
        fontSize: '12px',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '4px',
    },
    priceLabel: { color: '#8888aa', fontSize: '11px', margin: '0 0 2px 0' },
    price: { color: '#e94560', fontWeight: '700', fontSize: '20px', margin: 0 },
    endTime: { textAlign: 'right' },
    endLabel: { color: '#8888aa', fontSize: '11px', margin: '0 0 2px 0' },
    endValue: { color: '#ffa500', fontSize: '13px', margin: 0 },
    cardButton: {
        width: '100%',
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '4px',
    },
}

export default Products