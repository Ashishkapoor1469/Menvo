import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Plus, ShoppingBag, Trash2, Upload, X } from 'lucide-react'
import { MobileShell } from '../components/layout/MobileShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { menuApi, categoryApi } from '../services/api'
import type { Category } from '../types/menu'
import './Dashboard.css' // Reuse some dashboard styles

interface CsvRow {
  name: string
  price: number
  originalPrice?: number
  weight?: string
  description?: string
  isAvailable?: boolean
  errors: string[]
}

export function CategoryItems() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as { category?: Category; restaurantSlug?: string; restaurantCurrency?: string }
  const [category, setCategory] = useState<Category | null>(state?.category || null)
  const slug = state?.restaurantSlug || ''
  const currency = state?.restaurantCurrency || 'INR'

  const [backendStatus, setBackendStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [importProgress, setImportProgress] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  // Form State
  const [menuItemName, setMenuItemName] = useState('')
  const [menuItemPrice, setMenuItemPrice] = useState('')
  const [menuItemDescription, setMenuItemDescription] = useState('')
  const [menuItemPhoto, setMenuItemPhoto] = useState('')
  const [menuItemPrepTime, setMenuItemPrepTime] = useState('')
  const [menuItemDietary, setMenuItemDietary] = useState<'veg' | 'non-veg' | 'vegan' | ''>('')
  const [menuItemOriginalPrice, setMenuItemOriginalPrice] = useState('')
  const [menuItemDiscountPercent, setMenuItemDiscountPercent] = useState('')
  const [menuItemWeight, setMenuItemWeight] = useState('')

  useEffect(() => {
    if (!category && id && slug) {
      categoryApi.list(slug)
        .then(cats => {
          const cat = cats.find(c => String(c.id) === id)
          if (cat) {
            setCategory({ ...cat, name: String(cat.name || (cat as any).categoryName || (cat as any).slug || ''), items: cat.items ?? [] })
          } else {
            setBackendStatus('Category not found')
          }
        })
        .catch(err => setBackendStatus(err.message))
    }
  }, [category, id, slug])

  async function submitMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!menuItemName.trim() || !menuItemPrice || !id) return
    setIsSaving(true)
    try {
      const payload: any = { 
        categoryId: id, 
        name: menuItemName.trim(), 
        price: parseFloat(menuItemPrice),
        description: menuItemDescription.trim() || undefined,
        imageUrl: menuItemPhoto.trim() || undefined,
        preparationTime: menuItemPrepTime ? parseInt(menuItemPrepTime) : undefined,
        dietaryPreference: menuItemDietary || undefined,
        originalPrice: menuItemOriginalPrice ? parseFloat(menuItemOriginalPrice) : undefined,
        discountPercent: menuItemDiscountPercent ? parseInt(menuItemDiscountPercent) : undefined,
        weight: menuItemWeight.trim() || undefined
      }

      if (editingItemId) {
        const result = await menuApi.updateItem(editingItemId, payload)
        const updatedItem = (result as any).data ?? result
        setCategory(prev => prev ? { ...prev, items: (prev.items || []).map(i => String(i.id) === editingItemId ? updatedItem as any : i) } : null)
        setBackendStatus('Item updated')
      } else {
        const result = await menuApi.create(payload)
        const newItem = (result as any).data ?? result
        setCategory(prev => prev ? { ...prev, items: [...(prev.items || []), newItem as any] } : null)
        setBackendStatus('Item saved')
      }
      
      resetForm()
    } catch (e) {
      setBackendStatus(e instanceof Error ? e.message : 'Failed to save item')
    } finally { setIsSaving(false) }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await menuApi.deleteItem(itemId)
      setCategory(prev => prev ? { ...prev, items: (prev.items || []).filter(i => String(i.id) !== itemId) } : null)
      setBackendStatus('Item deleted')
    } catch (e) {
      setBackendStatus(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setItemToDelete(null)
    }
  }

  function handleEditItem(item: any) {
    setEditingItemId(String(item.id))
    setMenuItemName(item.name || '')
    setMenuItemPrice(item.price ? String(item.price) : '')
    setMenuItemDescription(item.description || '')
    setMenuItemPhoto(item.imageUrl || '')
    setMenuItemPrepTime(item.preparationTime ? String(item.preparationTime) : '')
    setMenuItemDietary(item.dietaryPreference || '')
    setMenuItemOriginalPrice(item.originalPrice ? String(item.originalPrice) : '')
    setMenuItemDiscountPercent(item.discountPercent ? String(item.discountPercent) : '')
    setMenuItemWeight(item.weight || '')
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingItemId(null)
    setMenuItemName('')
    setMenuItemPrice('')
    setMenuItemDescription('')
    setMenuItemPhoto('')
    setMenuItemPrepTime('')
    setMenuItemDietary('')
    setMenuItemOriginalPrice('')
    setMenuItemDiscountPercent('')
    setMenuItemWeight('')
  }

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const dataLines = lines[0]?.toLowerCase().startsWith('name,price') ? lines.slice(1) : lines
    setCsvRows(dataLines.map((line) => {
      const [name = '', price = '', originalPrice = '', weight = '', description = '', isAvailable = 'true'] = line.split(',').map((cell) => cell.trim())
      const parsedPrice = Number(price)
      const parsedOriginal = originalPrice ? Number(originalPrice) : undefined
      const errors: string[] = []
      if (!name) errors.push('Name required')
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) errors.push('Valid price required')
      if (parsedOriginal !== undefined && !Number.isFinite(parsedOriginal)) errors.push('Original price invalid')
      return { name, price: parsedPrice, originalPrice: parsedOriginal, weight: weight || undefined, description: description || undefined, isAvailable: !['false', '0', 'no'].includes(isAvailable.toLowerCase()), errors }
    }))
    setImportProgress('')
  }

  function handleCsvFile(file?: File) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportProgress('Please select a CSV file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => parseCsv(String(reader.result || ''))
    reader.onerror = () => setImportProgress('Could not read file')
    reader.readAsText(file)
  }

  async function confirmImport() {
    if (!id) return
    const validRows = csvRows.filter((row) => row.errors.length === 0)
    let success = 0
    let failed = 0
    setIsImporting(true)
    for (let index = 0; index < validRows.length; index += 1) {
      setImportProgress(`${index + 1} of ${validRows.length} imported`)
      try {
        const result = await menuApi.create({ ...validRows[index], categoryId: id })
        const newItem = (result as any).data ?? result
        setCategory((prev) => prev ? { ...prev, items: [...(prev.items || []), newItem as any] } : null)
        success += 1
      } catch {
        failed += 1
      }
    }
    setImportProgress(`${success} imported, ${failed + (csvRows.length - validRows.length)} failed`)
    setIsImporting(false)
  }

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$'

  if (!category) {
    return (
      <MobileShell variant="surface">
        <div style={{ padding: 20 }}>
          <button onClick={() => navigate('/dashboard?tab=categories')} className="dashboard__new-btn dashboard__new-btn--small" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <p style={{ marginTop: 20 }}>{backendStatus || 'Loading category...'}</p>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell variant="surface">
      <main className="dashboard">
        <header className="dashboard__header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard?tab=categories')} className="dashboard__new-btn dashboard__new-btn--small" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.2rem' }}>
            {category.name || `Category #${category.id}`}
          </h1>
          <button className="dashboard__new-btn dashboard__new-btn--small" onClick={() => setShowImportModal(true)} type="button">
            <Upload size={14} /> Import CSV
          </button>
        </header>

        {backendStatus && (
          <div style={{ padding: '0 16px', color: 'var(--color-text-secondary)', fontSize: 13, textAlign: 'center' }}>
            {backendStatus}
          </div>
        )}

        <section className="dashboard__section" style={{ marginTop: 16 }}>
          <form className="dashboard__form" onSubmit={submitMenuItem} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: 'var(--color-accent-yellow)', color: 'var(--color-brand-dark)', padding: 6, borderRadius: 8 }}>
                  {editingItemId ? <Edit2 size={16} /> : <Plus size={16} />}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{editingItemId ? 'Edit Item' : 'Add New Item'}</h3>
              </div>
              {editingItemId && (
                <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                  Cancel
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <Input placeholder="Item name (e.g. Garlic Bread)" value={menuItemName} onChange={(e) => setMenuItemName(e.target.value)} required style={{ flex: 1 }} />
              <Input placeholder="Price" type="number" step="0.01" value={menuItemPrice} onChange={(e) => setMenuItemPrice(e.target.value)} required style={{ flex: '0 0 100px' }} />
            </div>
            <Input placeholder="Description (optional)" value={menuItemDescription} onChange={(e) => setMenuItemDescription(e.target.value)} />
            <Input placeholder="Photo URL (optional)" value={menuItemPhoto} onChange={(e) => setMenuItemPhoto(e.target.value)} />
            
            <div style={{ display: 'flex', gap: 8 }}>
              <Input placeholder="Prep Time (mins)" type="number" value={menuItemPrepTime} onChange={(e) => setMenuItemPrepTime(e.target.value)} style={{ flex: 1 }} />
              <select 
                value={menuItemDietary} 
                onChange={(e) => setMenuItemDietary(e.target.value as any)}
                className="dashboard__select"
                style={{ flex: 1 }}
              >
                <option value="">No Dietary Preference</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <Input placeholder="Orig. Price" type="number" step="0.01" value={menuItemOriginalPrice} onChange={(e) => setMenuItemOriginalPrice(e.target.value)} style={{ flex: 1 }} />
              <Input placeholder="Discount %" type="number" value={menuItemDiscountPercent} onChange={(e) => setMenuItemDiscountPercent(e.target.value)} style={{ flex: 1 }} />
              <Input placeholder="Weight (e.g. 1 kg)" value={menuItemWeight} onChange={(e) => setMenuItemWeight(e.target.value)} style={{ flex: 1 }} />
            </div>
            
            <Button isLoading={isSaving} type="submit" style={{ marginTop: 8, width: '100%', background: 'var(--color-accent-green)', color: 'var(--color-on-dark)' }}>
              {editingItemId ? 'Update Item' : 'Add Item'}
            </Button>
          </form>
        </section>

        <section className="dashboard__section">
          <div className="cat-detail" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div className="cat-detail__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="cat-detail__title" style={{ margin: 0 }}>Current Items</h3>
              <span className="cat-detail__badge" style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                {category.items?.length ?? 0} items
              </span>
            </div>
            
            {category.items && category.items.length > 0 ? (
              <ul className="cat-detail__items" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {category.items.map((item: any) => (
                  <li key={item.id} className="cat-detail__item" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, background: 'var(--color-surface-2)' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 20 }}>
                        🍔
                      </div>
                    )}
                    
                    <div className="cat-detail__item-info" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="cat-detail__item-name" style={{ display: 'block', fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{item.name}</span>
                        <span className="cat-detail__item-price" style={{ fontWeight: 700, color: 'var(--color-accent-green)', fontSize: 14 }}>
                          {currencySymbol}{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && <span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{item.description}</span>}
                      
                      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        <button 
                          onClick={() => handleEditItem(item)} 
                          type="button" 
                          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => setItemToDelete(String(item.id))} 
                          type="button" 
                          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard__empty-inline">
                <ShoppingBag size={48} />
                <h2>No items yet</h2>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Plus size={16} /> Add first item
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {showImportModal && (
        <div className="import-modal" role="dialog" aria-modal="true">
          <div className="import-modal__panel">
            <button className="dashboard__close-btn" type="button" onClick={() => setShowImportModal(false)} aria-label="Close import modal">
              <X size={16} />
            </button>
            <h2>Import CSV</h2>
            <label
              className="import-modal__dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                handleCsvFile(event.dataTransfer.files[0])
              }}
            >
              <Upload size={28} />
              <span>Drop a .csv file or browse</span>
              <input accept=".csv" type="file" onChange={(event) => handleCsvFile(event.target.files?.[0])} />
            </label>
            <code className="import-modal__example">name,price,originalPrice,weight,description,isAvailable</code>
            {csvRows.length ? (
              <div className="import-modal__preview">
                <table>
                  <thead><tr><th>Name</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {csvRows.map((row, index) => (
                      <tr key={`${row.name}-${index}`} className={row.errors.length ? 'import-modal__row--error' : ''}>
                        <td>{row.name || '-'}</td>
                        <td>{Number.isFinite(row.price) ? row.price : '-'}</td>
                        <td>{row.errors.length ? row.errors.join(', ') : 'Ready'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {importProgress ? <p className="dashboard__save-status">{importProgress}</p> : null}
            <Button isLoading={isImporting} disabled={!csvRows.length} onClick={confirmImport}>Confirm Import</Button>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!itemToDelete} 
        title="Delete Item" 
        message="Are you sure you want to delete this menu item? This action cannot be undone." 
        onConfirm={() => itemToDelete && handleDeleteItem(itemToDelete)} 
        onCancel={() => setItemToDelete(null)} 
        confirmText="Delete" 
        isDestructive 
      />
    </MobileShell>
  )
}
