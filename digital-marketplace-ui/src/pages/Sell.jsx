import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import Navbar from '../components/Navbar'

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
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>List a Product</h1>
                    <p style={styles.subtitle}>Fill in the details to list your product on the marketplace</p>
                </div>

                {/* Step Indicator */}
                <div style={styles.steps}>
                    <div style={styles.stepItem}>
                        <div style={{
                            ...styles.stepCircle,
                            backgroundColor: step >= 1 ? '#38240D' : '#fff',
                            color: step >= 1 ? '#FDFBD4' : '#9a7a5a',
                            border: `0.5px solid ${step >= 1 ? '#38240D' : '#d4c8b0'}`,
                        }}>1</div>
                        <span style={{ ...styles.stepLabel, color: step === 1 ? '#38240D' : '#9a7a5a' }}>
                            Basic Details
                        </span>
                    </div>
                    <div style={styles.stepLine} />
                    <div style={styles.stepItem}>
                        <div style={{
                            ...styles.stepCircle,
                            backgroundColor: step >= 2 ? '#38240D' : '#fff',
                            color: step >= 2 ? '#FDFBD4' : '#9a7a5a',
                            border: `0.5px solid ${step >= 2 ? '#38240D' : '#d4c8b0'}`,
                        }}>2</div>
                        <span style={{ ...styles.stepLabel, color: step === 2 ? '#38240D' : '#9a7a5a' }}>
                            Product History
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.card}>

                        {/* Step 1 */}
                        {step === 1 && (
                            <>
                                <div style={styles.row}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Sale Type</label>
                                        <select name="saleType" value={form.saleType} onChange={handleChange} style={styles.input}>
                                            <option value="AUCTION">Auction</option>
                                            <option value="DIRECT">Direct Sale</option>
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Category *</label>
                                        <select name="category" value={form.category} onChange={handleChange} style={styles.input} required>
                                            <option value="">Select category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Product Name *</label>
                                        <input name="name" type="text" placeholder="e.g. iPhone 14 Pro"
                                               value={form.name} onChange={handleChange} style={styles.input} required />
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Brand</label>
                                        <input name="brand" type="text" placeholder="e.g. Apple, Samsung"
                                               value={form.brand} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Description</label>
                                    <textarea name="description" placeholder="Describe your product in detail..."
                                              value={form.description} onChange={handleChange}
                                              style={{ ...styles.input, height: '90px', resize: 'vertical' }} />
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>
                                            {form.saleType === 'AUCTION' ? 'Starting Price (₹) *' : 'Price (₹) *'}
                                        </label>
                                        <input name="startingPrice" type="number" placeholder="e.g. 50000"
                                               value={form.startingPrice} onChange={handleChange}
                                               style={styles.input} required min="1" />
                                    </div>
                                    {form.saleType === 'AUCTION' && (
                                        <div style={styles.field}>
                                            <label style={styles.label}>Bid Increment (₹) *</label>
                                            <input name="bidIncrement" type="number" placeholder="e.g. 1000"
                                                   value={form.bidIncrement} onChange={handleChange}
                                                   style={styles.input} required min="1" />
                                        </div>
                                    )}
                                </div>

                                {form.saleType === 'AUCTION' && (
                                    <div style={styles.field}>
                                        <label style={styles.label}>Auction End Time *</label>
                                        <input name="auctionEndTime" type="datetime-local"
                                               value={form.auctionEndTime} onChange={handleChange}
                                               style={styles.input} required />
                                    </div>
                                )}

                                <div style={styles.field}>
                                    <label style={styles.label}>Location / City</label>
                                    <input name="location" type="text" placeholder="e.g. Hyderabad"
                                           value={form.location} onChange={handleChange} style={styles.input} />
                                </div>

                                {/* Image Upload */}
                                <div style={styles.field}>
                                    <label style={styles.label}>Product Image</label>
                                    <div style={styles.imageUploadBox}>
                                        {imagePreview ? (
                                            <div style={styles.previewBox}>
                                                <img src={imagePreview} alt="preview" style={styles.previewImg} />
                                                <button type="button"
                                                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                                                        style={styles.removeImg}>
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <label style={styles.uploadLabel}>
                                                <input type="file" accept="image/*"
                                                       onChange={handleImageChange} style={{ display: 'none' }} />
                                                <span style={styles.uploadIcon}>📷</span>
                                                <span style={styles.uploadText}>Click to upload image</span>
                                                <span style={styles.uploadHint}>JPG, PNG up to 5MB</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <button type="button" style={styles.nextButton} onClick={() => setStep(2)}>
                                    Next: Product History →
                                </button>
                            </>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <>
                                <div style={styles.row}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Purchase Month</label>
                                        <select name="purchaseMonth" value={form.purchaseMonth} onChange={handleChange} style={styles.input}>
                                            <option value="">Select month</option>
                                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Purchase Year</label>
                                        <input name="purchaseYear" type="number" placeholder="e.g. 2022"
                                               value={form.purchaseYear} onChange={handleChange}
                                               style={styles.input} min="2000" max={new Date().getFullYear()} />
                                    </div>
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Product Condition *</label>
                                        <select name="productCondition" value={form.productCondition} onChange={handleChange} style={styles.input} required>
                                            <option value="">Select condition</option>
                                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Warranty Remaining</label>
                                        <input name="warrantyRemaining" type="text" placeholder="e.g. 6 months, None"
                                               value={form.warrantyRemaining} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Damages or Defects</label>
                                    <textarea name="damages"
                                              placeholder="Describe any scratches, dents, or issues. Write 'None' if no damages."
                                              value={form.damages} onChange={handleChange}
                                              style={{ ...styles.input, height: '90px', resize: 'vertical' }} />
                                </div>

                                {error && <div style={styles.error}>{error}</div>}
                                {success && <div style={styles.successBox}>{success}</div>}

                                <div style={styles.row}>
                                    <button type="button" style={styles.backButton} onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button type="submit" style={styles.submitButton} disabled={loading}>
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

const styles = {
    page: { backgroundColor: '#f7f4ec', minHeight: '100vh' },
    container: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px' },
    header: { marginBottom: '28px' },
    title: { color: '#38240D', fontSize: '26px', fontWeight: '500', margin: '0 0 6px 0' },
    subtitle: { color: '#9a7a5a', fontSize: '14px', margin: 0 },
    steps: { display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '12px' },
    stepItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    stepCircle: {
        width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '500',
    },
    stepLabel: { fontSize: '13px' },
    stepLine: { flex: 1, height: '0.5px', backgroundColor: '#d4c8b0' },
    card: {
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '32px', border: '0.5px solid #e8e0d0',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '18px' },
    label: {
        display: 'block', color: '#713600',
        fontSize: '13px', marginBottom: '7px',
    },
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '0.5px solid #d4c8b0', backgroundColor: '#faf9f5',
        color: '#38240D', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
    },
    imageUploadBox: {
        border: '0.5px dashed #d4c8b0', borderRadius: '10px', overflow: 'hidden',
        backgroundColor: '#faf9f5',
    },
    uploadLabel: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '28px', cursor: 'pointer', gap: '6px',
    },
    uploadIcon: { fontSize: '28px' },
    uploadText: { color: '#38240D', fontSize: '14px' },
    uploadHint: { color: '#9a7a5a', fontSize: '12px' },
    previewBox: { position: 'relative', height: '180px' },
    previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
    removeImg: {
        position: 'absolute', top: '8px', right: '8px',
        backgroundColor: '#38240D', color: '#FDFBD4',
        border: 'none', padding: '4px 10px',
        borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
    },
    error: {
        backgroundColor: '#ff000010', color: '#a33000',
        padding: '12px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '13px',
        border: '0.5px solid #ff000025',
    },
    successBox: {
        backgroundColor: '#71360010', color: '#713600',
        padding: '12px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '13px',
        border: '0.5px solid #71360025',
    },
    nextButton: {
        width: '100%', padding: '11px',
        backgroundColor: '#C05800', color: '#FDFBD4',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', cursor: 'pointer',
    },
    backButton: {
        flex: 1, padding: '11px', backgroundColor: '#fff',
        color: '#9a7a5a', border: '0.5px solid #d4c8b0',
        borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
    },
    submitButton: {
        flex: 2, padding: '11px',
        backgroundColor: '#38240D', color: '#FDFBD4',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', cursor: 'pointer',
    },
}

export default Sell