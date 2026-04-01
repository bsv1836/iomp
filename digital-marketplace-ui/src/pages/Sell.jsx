import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'
import './Sell.css'

const CATEGORIES = [
    'Electronics', 'Mobile Phones', 'Computers & Laptops',
    'Furniture', 'Vehicles', 'Clothing & Fashion',
    'Books', 'Sports & Fitness', 'Home Appliances',
    'Cameras', 'Musical Instruments', 'Collectibles', 'Other'
]

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor']

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

function Sell() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', description: '', startingPrice: '', bidIncrement: '',
        auctionEndTime: '', saleType: 'AUCTION', category: '', brand: '',
        productCondition: '', damages: '', location: '',
        purchaseMonth: '', purchaseYear: '', warrantyRemaining: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setSuccess('')
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        try {
            const payload = {
                name: form.name, description: form.description,
                startingPrice: parseFloat(form.startingPrice),
                bidIncrement: form.saleType === 'AUCTION' ? parseFloat(form.bidIncrement) : 1,
                saleType: form.saleType, category: form.category, brand: form.brand,
                productCondition: form.productCondition, damages: form.damages,
                location: form.location,
                purchaseMonth: form.purchaseMonth ? parseInt(form.purchaseMonth) : null,
                purchaseYear: form.purchaseYear ? parseInt(form.purchaseYear) : null,
                warrantyRemaining: form.warrantyRemaining,
            }
            if (form.saleType === 'AUCTION' && form.auctionEndTime) {
                payload.auctionEndTime = form.auctionEndTime
            }
            const productRes = await API.post('/api/products', payload)
            const productId = productRes.data.productId
            if (imageFile) {
                const formData = new FormData()
                formData.append('file', imageFile)
                await API.post(`/api/images/upload/${productId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            setSuccess('Product listed successfully!')
            setTimeout(() => navigate('/products'), 1500)
        } catch (err) {
            setError('Failed to list product. Please check all fields.')
        } finally { setLoading(false) }
    }

    return (
        <div className="sell-page">
            <Navbar />
            <div className="sell-container">

                {/* Header */}
                <div className="sell-header">
                    <h1 className="sell-title">List a Product</h1>
                    <p className="sell-subtitle">Fill in the details to list your product on the marketplace</p>
                </div>

                {/* Step Indicator */}
                <div className="sell-steps">
                    <div className="sell-step-item">
                        <div className={`sell-step-circle ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
                        <span className={`sell-step-label ${step === 1 ? 'active' : 'inactive'}`}>
                            Basic Details
                        </span>
                    </div>
                    <div className="sell-step-line" />
                    <div className="sell-step-item">
                        <div className={`sell-step-circle ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
                        <span className={`sell-step-label ${step === 2 ? 'active' : 'inactive'}`}>
                            Product History
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="sell-card">

                        {/* Step 1 */}
                        {step === 1 && (
                            <>
                                <div className="sell-row">
                                    <div className="sell-field">
                                        <label className="sell-label">Sale Type</label>
                                        <select name="saleType" value={form.saleType} onChange={handleChange} className="sell-input">
                                            <option value="AUCTION">Auction</option>
                                            <option value="DIRECT">Direct Sale</option>
                                        </select>
                                    </div>
                                    <div className="sell-field">
                                        <label className="sell-label">Category *</label>
                                        <select name="category" value={form.category} onChange={handleChange} className="sell-input" required>
                                            <option value="">Select category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="sell-row">
                                    <div className="sell-field">
                                        <label className="sell-label">Product Name *</label>
                                        <input name="name" type="text" placeholder="e.g. iPhone 14 Pro"
                                               value={form.name} onChange={handleChange} className="sell-input" required />
                                    </div>
                                    <div className="sell-field">
                                        <label className="sell-label">Brand</label>
                                        <input name="brand" type="text" placeholder="e.g. Apple, Samsung"
                                               value={form.brand} onChange={handleChange} className="sell-input" />
                                    </div>
                                </div>

                                <div className="sell-field">
                                    <label className="sell-label">Description</label>
                                    <textarea name="description" placeholder="Describe your product in detail..."
                                              value={form.description} onChange={handleChange}
                                              className="sell-input sell-textarea" />
                                </div>

                                <div className="sell-row">
                                    <div className="sell-field">
                                        <label className="sell-label">
                                            {form.saleType === 'AUCTION' ? 'Starting Price (₹) *' : 'Price (₹) *'}
                                        </label>
                                        <input name="startingPrice" type="number" placeholder="e.g. 50000"
                                               value={form.startingPrice} onChange={handleChange}
                                               className="sell-input" required min="1" />
                                    </div>
                                    {form.saleType === 'AUCTION' && (
                                        <div className="sell-field">
                                            <label className="sell-label">Bid Increment (₹) *</label>
                                            <input name="bidIncrement" type="number" placeholder="e.g. 1000"
                                                   value={form.bidIncrement} onChange={handleChange}
                                                   className="sell-input" required min="1" />
                                        </div>
                                    )}
                                </div>

                                {form.saleType === 'AUCTION' && (
                                    <div className="sell-field">
                                        <label className="sell-label">Auction End Time *</label>
                                        <input name="auctionEndTime" type="datetime-local"
                                               value={form.auctionEndTime} onChange={handleChange}
                                               className="sell-input" required />
                                    </div>
                                )}

                                <div className="sell-field">
                                    <label className="sell-label">Location / City</label>
                                    <input name="location" type="text" placeholder="e.g. Hyderabad"
                                           value={form.location} onChange={handleChange} className="sell-input" />
                                </div>

                                {/* Image Upload */}
                                <div className="sell-field">
                                    <label className="sell-label">Product Image</label>
                                    <div className="sell-image-upload-box">
                                        {imagePreview ? (
                                            <div className="sell-preview-box">
                                                <img src={imagePreview} alt="preview" className="sell-preview-img" />
                                                <button type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                                                        className="sell-remove-img">
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="sell-upload-label">
                                                <input type="file" accept="image/*"
                                                       onChange={handleImageChange} style={{ display: 'none' }} />
                                                <span className="sell-upload-icon">📷</span>
                                                <span className="sell-upload-text">Click to upload image</span>
                                                <span className="sell-upload-hint">JPG, PNG up to 5MB</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <button type="button" className="sell-next-button" onClick={() => setStep(2)}>
                                    Next: Product History →
                                </button>
                            </>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <>
                                <div className="sell-row">
                                    <div className="sell-field">
                                        <label className="sell-label">Purchase Month</label>
                                        <select name="purchaseMonth" value={form.purchaseMonth} onChange={handleChange} className="sell-input">
                                            <option value="">Select month</option>
                                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="sell-field">
                                        <label className="sell-label">Purchase Year</label>
                                        <input name="purchaseYear" type="number" placeholder="e.g. 2022"
                                               value={form.purchaseYear} onChange={handleChange}
                                               className="sell-input" min="2000" max={new Date().getFullYear()} />
                                    </div>
                                </div>

                                <div className="sell-row">
                                    <div className="sell-field">
                                        <label className="sell-label">Product Condition *</label>
                                        <select name="productCondition" value={form.productCondition} onChange={handleChange} className="sell-input" required>
                                            <option value="">Select condition</option>
                                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="sell-field">
                                        <label className="sell-label">Warranty Remaining</label>
                                        <input name="warrantyRemaining" type="text" placeholder="e.g. 6 months, None"
                                               value={form.warrantyRemaining} onChange={handleChange} className="sell-input" />
                                    </div>
                                </div>

                                <div className="sell-field">
                                    <label className="sell-label">Damages or Defects</label>
                                    <textarea name="damages"
                                              placeholder="Describe any scratches, dents, or issues. Write 'None' if no damages."
                                              value={form.damages} onChange={handleChange}
                                              className="sell-input sell-textarea" />
                                </div>

                                {error && <div className="sell-error">{error}</div>}
                                {success && <div className="sell-success-box">{success}</div>}

                                <div className="sell-action-row">
                                    <button type="button" className="sell-back-button" onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button type="submit" className="sell-submit-button" disabled={loading}>
                                        {loading ? 'Listing...' : 'List Product'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Sell