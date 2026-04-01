import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import './Products.css'

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
        <div className="products-page">
            <Navbar />

            <div className="products-container">
                {loading ? (
                    <div className="products-loading">
                        <p className="products-loading-text">Loading products...</p>
                    </div>
                ) : (
                    <>
                        {/* Category Filter */}
                        {categories.length > 1 && (
                            <div className="products-category-bar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`products-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Live Auctions */}
                        <section className="products-section">
                            <div className="products-section-header">
                                <div>
                                    <h2 className="products-section-title">Live Auctions</h2>
                                    <p className="products-section-subtitle">Place bids and win products at the best price</p>
                                </div>
                                <span className="products-count-badge">{filteredAuctions.length} active</span>
                            </div>
                            {filteredAuctions.length === 0 ? (
                                <EmptyBox text="No active auctions in this category." />
                            ) : (
                                <div className="products-grid">
                                    {filteredAuctions.map(p => (
                                        <ProductCard key={p.productId} product={p} onClick={() => navigate(`/products/${p.productId}`)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="products-divider" />

                        {/* Buy Now */}
                        <section className="products-section">
                            <div className="products-section-header">
                                <div>
                                    <h2 className="products-section-title">Buy Now</h2>
                                    <p className="products-section-subtitle">Purchase products instantly at a fixed price</p>
                                </div>
                                <span className="products-count-badge">
                                    {filteredDirect.length} available
                                </span>
                            </div>
                            {filteredDirect.length === 0 ? (
                                <EmptyBox text="No direct sale products in this category." />
                            ) : (
                                <div className="products-grid">
                                    {filteredDirect.map(p => (
                                        <ProductCard key={p.productId} product={p} onClick={() => navigate(`/products/${p.productId}`)} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Unavailable */}
                        {unavailable.length > 0 && (
                            <>
                                <div className="products-divider" />
                                <section className="products-section">
                                    <div className="products-section-header">
                                        <div>
                                            <h2 className="products-section-title" style={{ color: '#6B7280' }}>No Longer Available</h2>
                                            <p className="products-section-subtitle">These products have been sold, pending or expired</p>
                                        </div>
                                        <span className="products-count-badge">
                                            {unavailable.length} items
                                        </span>
                                    </div>
                                    <div className="products-grid">
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
    const statusClass = unavailable ? 'bg-unavailable' : isAuction ? 'bg-auction' : 'bg-direct';

    return (
        <div className={`product-card ${unavailable ? 'unavailable' : ''}`} onClick={onClick}>
            {/* Image */}
            {product.imagePath ? (
                <div className="product-image-box">
                    <img src={product.imagePath} alt={product.name} className="product-image" />
                    <span className={`product-badge ${statusClass}`}>
                        {unavailable ? product.status : isAuction ? 'AUCTION' : 'BUY NOW'}
                    </span>
                </div>
            ) : (
                <div className="product-no-image-box">
                    <div className="product-no-image-inner">
                        <span className="product-no-image-icon">{isAuction ? '🔨' : '🛍️'}</span>
                        <span className={`product-badge product-badge-no-img ${statusClass}`}>
                            {unavailable ? product.status : isAuction ? 'AUCTION' : 'BUY NOW'}
                        </span>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="product-card-body">
                <div className="product-card-top-row">
                    <h3 className="product-card-title">{product.name}</h3>
                    {product.brand && <p className="product-card-brand">{product.brand}</p>}
                </div>

                <div className="product-card-meta">
                    {product.category && <span className="product-meta-chip">{product.category}</span>}
                    {product.location && <span className="product-meta-chip">📍 {product.location}</span>}
                    {product.productCondition && <span className="product-meta-chip">{product.productCondition}</span>}
                </div>

                <div className="product-card-footer">
                    <div>
                        <p className="product-price-label">{isAuction ? 'Current Bid' : 'Price'}</p>
                        <p className="product-price">₹{product.currentPrice?.toLocaleString()}</p>
                    </div>
                    {isAuction && product.auctionEndTime && !unavailable && (
                        <div style={{ textAlign: 'right' }}>
                            <p className="product-price-label">Ends</p>
                            <p className="product-end-value">{new Date(product.auctionEndTime).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>

                {!unavailable && (
                    <button className={`product-card-button ${!isAuction ? 'product-card-button-secondary' : ''}`}>
                        {isAuction ? 'Place Bid' : 'Buy Now'}
                    </button>
                )}
            </div>
        </div>
    )
}

function EmptyBox({ text }) {
    return (
        <div className="products-empty-box">
            <p className="products-empty-text">{text}</p>
        </div>
    )
}

export default Products