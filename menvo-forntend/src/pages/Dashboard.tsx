import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Copy, ExternalLink, LayoutGrid, Plus, Trash2, UtensilsCrossed, X, Edit2 } from 'lucide-react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BottomNav } from '../components/layout/BottomNav'
import { MobileShell } from '../components/layout/MobileShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { RestaurantCard } from '../components/menu/RestaurantCard'
import { RestaurantDialog } from '../components/menu/RestaurantDialog'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { categoryApi, restaurantApi } from '../services/api'
import { useRestaurantStore } from '../store/restaurantStore'
import { env } from '../config/env'
import type { Category, Restaurant, Table } from '../types/menu'
import './Dashboard.css'

const settingsSchema = z.object({
  restaurantName: z.string().trim().min(2, 'Restaurant name must be at least 2 characters'),
  restaurantBio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  address: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  logoUrl: z.string().optional(),
})

type SettingsForm = z.infer<typeof settingsSchema>

const titles: Record<string, string> = {
  menu: 'Menu',
  categories: 'Categories',
  qr: 'QR Code',
  settings: 'Settings',
}

const categoryIcons = ['🍽️', '🥗', '🍔', '🍕', '🍜', '🍛', '🍰', '☕', '🥤']

const defaultTables: Table[] = [
  { id: 'A1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'A2', seats: 4, status: 'scanned', label: 'QR scanned' },
  { id: 'A3', seats: 4, status: 'ordered', label: 'Order placed' },
  { id: 'B1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'B2', seats: 6, status: 'ordered', label: 'Order placed' },
  { id: 'B3', seats: 4, status: 'scanned', label: 'QR scanned' },
  { id: 'C1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'C2', seats: 8, status: 'empty', label: 'No customer' },
]

export function Dashboard({ sample = false }: { sample?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const storedSlug = useRestaurantStore((s) => s.activeRestaurantSlug)
  const setStoreSlug = useRestaurantStore((s) => s.setActiveRestaurant)
  const initialSlug = location.state?.restaurantSlug || storedSlug || 'demo'

  const { tab } = useParams<{ tab: string }>()
  const activeTab = tab || 'menu'
  const [backendStatus, setBackendStatus] = useState(sample ? 'Sample mode' : 'Checking...')
  const [restaurantSlug, setRestaurantSlug] = useState(initialSlug)
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryIcon, setCategoryIcon] = useState(categoryIcons[0])
  const [categories, setCategories] = useState<Category[]>([])

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const hiddenSvgRef = useRef<HTMLDivElement | null>(null)
  const [tableCount, setTableCount] = useState<number | ''>(1)
  const [generatedTables, setGeneratedTables] = useState<number[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [, setCategoriesLoading] = useState(true)

  // Dialog states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  // Category dialog for Categories tab
  const [catDialogRestaurant, setCatDialogRestaurant] = useState<Restaurant | null>(null)
  const [catDialogCategories, setCatDialogCategories] = useState<Category[]>([])
  const [showCreateCatForm, setShowCreateCatForm] = useState(false)
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [deleteRestaurantOpen, setDeleteRestaurantOpen] = useState(false)

  // Clear backendStatus when switching tabs
  useEffect(() => {
    if (!sample) setBackendStatus('')
  }, [activeTab, sample])

  const settingsForm = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      restaurantName: '',
      restaurantBio: '',
      address: '',
      currency: 'USD',
      logoUrl: '',
    },
  })

  useEffect(() => {
    if (sample) return
    restaurantApi.greet()
      .then((msg) => setBackendStatus(typeof msg === 'string' ? msg : 'Connected'))
      .catch((e) => setBackendStatus(e instanceof Error ? e.message : 'Unavailable'))
  }, [sample])

  useEffect(() => {
    if (sample) return
    restaurantApi.list()
      .then((data) => {
        const mapped: Restaurant[] = (data || []).map((r: any) => ({
          id: String(r.id), name: r.name || r.restaurantName || 'Unnamed',
          slug: r.slug || '', bio: r.bio || r.restaurantBio || '',
          logoUrl: r.logoUrl || '', address: r.address || '', currency: r.currency || 'USD',
          categories: (r.categories || []).map((c: any) => ({ ...c, icon: c.icon || categoryIcons[0], name: String(c.name || c.categoryName || c.slug || ''), items: c.items ?? [] })),
          tables: defaultTables,
        }))
        setRestaurants(mapped)
        // Set active restaurant for settings tab
        const active = mapped.find((r) => r.slug === restaurantSlug) || mapped[0]
        if (active) {
          setActiveRestaurantId(active.id)
          settingsForm.reset({
            restaurantName: active.name,
            restaurantBio: active.bio || '',
            logoUrl: active.logoUrl || '',
            address: active.address || '',
            currency: (active.currency as SettingsForm['currency']) || 'USD',
          })
          if (active.slug && active.slug !== restaurantSlug) {
            setRestaurantSlug(active.slug)
          }
          setStoreSlug(active.slug)
          if (active.categories?.length) setCategories(active.categories)
          // Auto-expand the only restaurant for Categories tab
          if (mapped.length === 1) {
            setExpandedRestaurantId(active.id)
            setCatDialogRestaurant(active)
            setCatDialogCategories(active.categories || [])
          }
        }
      })
      .catch(() => {
        if (restaurantSlug && restaurantSlug !== 'demo') {
          setRestaurants([{ id: '1', name: restaurantSlug, slug: restaurantSlug, bio: '', categories: [], tables: defaultTables }])
        }
      })
  }, [sample])

  useEffect(() => {
    if (sample || !restaurantSlug.trim()) return
    setCategoriesLoading(true)
    categoryApi.list(restaurantSlug.trim())
      .then((resp) => {
        const cats = resp.map((c: any) => ({ ...c, icon: c.icon || categoryIcons[0], name: String(c.name || c.categoryName || c.slug || ''), items: c.items ?? [] }))
        setCategories(cats)
        setRestaurants((prev) => prev.map((r) => r.slug === restaurantSlug ? { ...r, categories: cats } : r))
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [restaurantSlug, sample])

  // Re-populate settings form when active restaurant changes
  useEffect(() => {
    const active = restaurants.find((r) => r.id === activeRestaurantId)
    if (active) {
      settingsForm.reset({
        restaurantName: active.name,
        restaurantBio: active.bio || '',
        logoUrl: active.logoUrl || '',
        address: active.address || '',
        currency: (active.currency as SettingsForm['currency']) || 'USD',
      })
    }
  }, [activeRestaurantId, restaurants])

  function getCatName(cat: any): string {
    return String(cat.name || cat.categoryName || cat.slug || `Category #${cat.id}`)
  }

  function openRestaurantDialog(r: Restaurant) {
    setSelectedRestaurant(r.slug === restaurantSlug ? { ...r, categories } : r)
    setShowDialog(true)
  }



  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const slug = catDialogRestaurant?.slug || restaurantSlug
    if (!categoryName.trim() || !slug?.trim()) return
    setIsSaving(true)
    try {
      let newCat: Category;
      if (categoryToEdit) {
        const result = await categoryApi.update(slug, String(categoryToEdit.id), { name: categoryName.trim(), icon: categoryIcon })
        const cat = (result as any).data ?? result
        newCat = { ...cat, icon: cat.icon || categoryIcon, name: getCatName(cat), items: categoryToEdit.items ?? [] }
        if (catDialogRestaurant) {
          setCatDialogCategories((prev) => prev.map(c => c.id === newCat.id ? newCat : c))
        }
        setCategories((prev) => prev.map(c => c.id === newCat.id ? newCat : c))
        setRestaurants((prev) => prev.map((r) => r.slug === slug ? { ...r, categories: r.categories?.map(c => c.id === newCat.id ? newCat : c) } : r))
        setCategoryToEdit(null)
      } else {
        const result = await categoryApi.create(slug.trim(), { name: categoryName.trim(), icon: categoryIcon })
        const cat = (result as any).data ?? result
        newCat = { ...cat, icon: cat.icon || categoryIcon, name: getCatName(cat), items: cat.items ?? [] }
        if (catDialogRestaurant) {
          setCatDialogCategories((prev) => [...prev, newCat])
        }
        setCategories((prev) => [...prev, newCat])
        setRestaurants((prev) => prev.map((r) => r.slug === slug ? { ...r, categories: [...(r.categories || []), newCat] } : r))
      }
      setCategoryName('')
      setCategoryIcon(categoryIcons[0])
      setShowCreateCatForm(false)
      setBackendStatus('Category saved')
    } catch (e) {
      setBackendStatus(e instanceof Error ? e.message : 'Failed')
    } finally { setIsSaving(false) }
  }



  async function handleDeleteCategory(catId: string) {
    const slug = catDialogRestaurant?.slug || restaurantSlug
    try {
      await categoryApi.remove(slug, catId)
      setCatDialogCategories((prev) => prev.filter((c) => String(c.id) !== catId))
      setCategories((prev) => prev.filter((c) => String(c.id) !== catId))
      setRestaurants((prev) => prev.map((r) => r.slug === slug ? { ...r, categories: r.categories?.filter(c => String(c.id) !== catId) } : r))
      setBackendStatus('Category deleted')
    } catch (e) {
      setBackendStatus(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setCategoryToDelete(null)
    }
  }

  function getPublicMenuUrl(tableNumber?: number | string) {
    const domain = env.appDomain || window.location.origin
    const base = domain.startsWith('http') ? domain : `https://${domain}`
    return `${base.replace(/\/$/, '')}/m/${restaurantSlug}${tableNumber ? `/t/${tableNumber}` : ''}`
  }

  function downloadCanvas(canvas: HTMLCanvasElement | null, fileName: string) {
    if (!canvas) return
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function downloadMainPng() {
    downloadCanvas(qrCanvasRef.current, `menvo-qr-${restaurantSlug}.png`)
  }

  function downloadMainSvg() {
    const svg = hiddenSvgRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `menvo-qr-${restaurantSlug}.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  async function copyMenuLink() {
    try {
      await navigator.clipboard.writeText(getPublicMenuUrl())
      setCopyStatus('Copied!')
      window.setTimeout(() => setCopyStatus(''), 2000)
    } catch {
      setCopyStatus('Copy failed')
    }
  }

  function generateTableQrs() {
    const count = Math.max(1, Math.min(50, Number(tableCount) || 1))
    setTableCount(count)
    setGeneratedTables(Array.from({ length: count }, (_, index) => index + 1))
  }

  async function saveSettings(values: SettingsForm) {
    if (!activeRestaurantId) {
      setSaveStatus('No restaurant selected')
      return
    }
    setIsSaving(true)
    setSaveStatus('')
    try {
      await restaurantApi.update(activeRestaurantId, {
        restaurantName: values.restaurantName.trim(),
        restaurantBio: values.restaurantBio?.trim() || undefined,
        logoUrl: values.logoUrl?.trim() || undefined,
        address: values.address?.trim() || undefined,
        currency: values.currency,
      })
      setRestaurants((prev) => prev.map((r) => (
        r.id === activeRestaurantId
          ? { ...r, name: values.restaurantName.trim(), bio: values.restaurantBio?.trim(), logoUrl: values.logoUrl?.trim(), address: values.address?.trim(), currency: values.currency }
          : r
      )))
      setSaveStatus('Changes saved')
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteActiveRestaurant() {
    if (!activeRestaurantId) return
    setIsSaving(true)
    setSaveStatus('')
    try {
      await restaurantApi.remove(activeRestaurantId)
      const remaining = restaurants.filter((r) => r.id !== activeRestaurantId)
      setRestaurants(remaining)
      if (remaining[0]) {
        setRestaurantSlug(remaining[0].slug)
        setStoreSlug(remaining[0].slug)
        setActiveRestaurantId(remaining[0].id)
      } else {
        navigate('/create-restaurant')
      }
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to delete restaurant')
    } finally {
      setIsSaving(false)
      setDeleteRestaurantOpen(false)
    }
  }

  const occupied = defaultTables.filter((t) => t.status !== 'empty').length
  const orders = defaultTables.filter((t) => t.status === 'ordered').length

  return (
    <MobileShell variant="surface">
      <main className="dashboard">
        {/* ── Header ── */}
        <header className="dashboard__header">
          <div className="dashboard__header-left"><p className="dashboard__brand">Menvo</p></div>
          <h1>{titles[activeTab]}</h1>
          <div className="dashboard__header-right">
            {activeTab === 'menu' && (
              <button className="dashboard__new-btn" onClick={() => navigate('/create-restaurant')} type="button">
                <Plus size={16} /><span>New Restaurant</span>
              </button>
            )}
            {activeTab === 'categories' && (
              <button className="dashboard__new-btn" onClick={() => setShowCreateCatForm(true)} type="button">
                <Plus size={16} /><span>New Category</span>
              </button>
            )}
            {activeTab !== 'menu' && activeTab !== 'categories' && (
              <span className="dashboard__status">{backendStatus}</span>
            )}
          </div>
        </header>

        {/* ── MENU TAB ── */}
        {activeTab === 'menu' && !sample && (
          <>
            <section className="dashboard__stats" aria-label="Dashboard stats">
              <div className="dashboard__stat-card"><strong>{categories.length}</strong><span>Categories</span></div>
              <div className="dashboard__stat-card"><strong>{categories.reduce((t, c) => t + (c.items?.length ?? 0), 0)}</strong><span>Items</span></div>
              <div className="dashboard__stat-card"><strong>{restaurants.length || (restaurantSlug !== 'demo' ? 1 : 0)}</strong><span>Restaurants</span></div>
            </section>

            {restaurants.length > 0 && (
              <section className="dashboard__section">
                <h2 className="dashboard__section-title">Your Restaurants</h2>
                <div className="dashboard__restaurant-grid">
                  {restaurants.map((r, i) => {
                    const rCats = r.slug === restaurantSlug ? categories : (r.categories || [])
                    return (
                      <RestaurantCard key={r.id} restaurant={{ ...r, categories: rCats }} onClick={() => openRestaurantDialog({ ...r, categories: rCats })} index={i} showMenuLink={true} />
                    )
                  })}
                </div>
              </section>
            )}



            {categories.length === 0 && restaurants.length === 0 && (
              <section className="dashboard__empty">
                <UtensilsCrossed size={64} className="dashboard__empty-svg" />
                <h2>No restaurant yet</h2>
                <p>Create your first restaurant to start managing your digital menu.</p>
                <Button onClick={() => navigate('/create-restaurant')} style={{ marginTop: '1rem' }}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Get Started
                </Button>
              </section>
            )}
          </>
        )}

        {/* ── CATEGORIES TAB ── */}
        {activeTab === 'categories' && !sample && (
          <>
            <section className="dashboard__stats" aria-label="Category stats">
              <div className="dashboard__stat-card"><strong>{categories.length}</strong><span>Categories</span></div>
              <div className="dashboard__stat-card"><strong>{categories.reduce((t, c) => t + (c.items?.length ?? 0), 0)}</strong><span>Total Items</span></div>
              <div className="dashboard__stat-card"><strong>{restaurants.length || (restaurantSlug !== 'demo' ? 1 : 0)}</strong><span>Restaurants</span></div>
            </section>

            {/* Create category form (toggled by header button) */}
            {showCreateCatForm && (
              <section className="dashboard__panel" style={{ marginTop: 12 }}>
                <div className="dashboard__panel-head">
                  <h2>{categoryToEdit ? 'Edit Category' : 'Create Category'}</h2>
                  <button className="dashboard__close-btn" onClick={() => { setShowCreateCatForm(false); setCategoryToEdit(null); setCategoryName(''); setCategoryIcon(categoryIcons[0]) }} type="button"><X size={16} /></button>
                </div>
                <form className="dashboard__form" onSubmit={submitCategory}>
                  <Input placeholder="e.g. Starters, Main Course, Drinks..." value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                  <div className="dashboard__icon-picker" aria-label="Choose category icon">
                    {categoryIcons.map((icon) => (
                      <button
                        className={`dashboard__icon-choice${categoryIcon === icon ? ' dashboard__icon-choice--active' : ''}`}
                        key={icon}
                        onClick={() => setCategoryIcon(icon)}
                        type="button"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <Button isLoading={isSaving} type="submit">{categoryToEdit ? 'Save Changes' : '+ Create Category'}</Button>
                </form>
              </section>
            )}

            {/* Restaurant Selection or Categories Management */}
            {restaurants.length > 0 && (
              <section className="dashboard__section">
                {!expandedRestaurantId && restaurants.length > 1 ? (
                  <>
                    <h2 className="dashboard__section-title">Select Restaurant to Manage</h2>
                    <div className="dashboard__restaurant-accordion">
                      {restaurants.map((r, i) => (
                        <div key={r.id} className="dashboard__restaurant-group">
                          <RestaurantCard 
                            restaurant={r} 
                            onClick={() => {
                              setExpandedRestaurantId(String(r.id))
                              setCatDialogRestaurant(r)
                              setRestaurantSlug(r.slug)
                              setStoreSlug(r.slug)
                              setActiveRestaurantId(r.id)
                              categoryApi.list(r.slug).then((resp) => {
                                const cats = resp.map((c: any) => ({ ...c, icon: c.icon || categoryIcons[0], name: getCatName(c), items: c.items ?? [] }))
                                setCatDialogCategories(cats)
                                setCategories(cats)
                              }).catch(() => setCatDialogCategories([]))
                            }} 
                            index={i} 
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="dashboard__categories-expanded" style={{ marginTop: 0 }}>
                    <div className="dashboard__categories-expanded-head" style={{ marginBottom: 16 }}>
                      {restaurants.length > 1 && (
                        <button className="dashboard__new-btn dashboard__new-btn--small" onClick={() => setExpandedRestaurantId(null)} type="button" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                          <span>← Back</span>
                        </button>
                      )}
                      <h3 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{catDialogRestaurant?.name} Categories</h3>
                      <button className="dashboard__new-btn dashboard__new-btn--small" onClick={() => {
                        setShowCreateCatForm(true)
                      }} type="button">
                        <Plus size={14} /><span>Add</span>
                      </button>
                    </div>
                    
                    {catDialogCategories.length > 0 ? (
                      <div className="dashboard__category-grid">
                        {catDialogCategories.map((cat) => (
                          <div key={cat.id} className="dashboard__category-card"
                            onClick={() => {
                              navigate(`/dashboard/categories/${cat.id}`, { 
                                state: { 
                                  category: cat,
                                  restaurantSlug: catDialogRestaurant?.slug,
                                  restaurantCurrency: catDialogRestaurant?.currency
                                } 
                              })
                            }}>
                            <div className="dashboard__category-card-accent" />
                            <div className="dashboard__category-card-content">
                              <div className="dashboard__category-card-icon">{cat.icon || categoryIcons[0]}</div>
                              <div className="dashboard__category-card-info">
                                <h3 className="dashboard__category-card-name">{getCatName(cat)}</h3>
                                <span className="dashboard__category-card-meta">{cat.items?.length ?? 0} items</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  className="cat-detail__item-delete" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setCategoryToEdit(cat); 
                                    setCategoryName(getCatName(cat)); 
                                    setCategoryIcon(cat.icon || categoryIcons[0]); 
                                    setShowCreateCatForm(true); 
                                  }} 
                                  type="button" 
                                  aria-label="Edit category"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  className="cat-detail__item-delete" 
                                  onClick={(e) => { e.stopPropagation(); setCategoryToDelete(String(cat.id)) }} 
                                  type="button" 
                                  aria-label="Delete category"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="dashboard__category-card-badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>
                                <Plus size={14} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="dashboard__empty-inline">
                        <LayoutGrid size={48} />
                        <h2>No categories yet</h2>
                        <Button onClick={() => setShowCreateCatForm(true)}>
                          <Plus size={16} /> Add your first category
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {restaurants.length === 0 && (
              <section className="dashboard__empty" style={{ marginTop: 16 }}>
                <UtensilsCrossed size={64} className="dashboard__empty-svg" />
                <h2>No restaurant yet</h2>
                <p>Create a restaurant first from the Menu tab, then manage its categories here.</p>
                <Button onClick={() => navigate('/create-restaurant')} style={{ marginTop: '1rem' }}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Get Started
                </Button>
              </section>
            )}

            {/* Coming soon features */}
            <section className="dashboard__coming-soon">
              <span>🚧</span>
              <p>Bulk import, category reordering & image uploads — <strong>coming soon!</strong></p>
            </section>
          </>
        )}

        {/* ── QR CODE TAB ── */}
        {activeTab === 'qr' && (
          <section className="dashboard__panel">
            <div className="dashboard__panel-head"><h2>QR Code</h2></div>
            <div className="dashboard__qr-info">
              {restaurantSlug && restaurantSlug !== 'demo' ? (
                <>
                  <div className="dashboard__qr-code">
                    <QRCodeCanvas ref={qrCanvasRef} value={getPublicMenuUrl()} size={200} level="H" includeMargin />
                  </div>
                  <div className="dashboard__qr-hidden" ref={hiddenSvgRef} aria-hidden="true">
                    <QRCodeSVG value={getPublicMenuUrl()} size={200} level="H" includeMargin />
                  </div>
                  <p>Scan to view menu</p>
                  <div className="dashboard__qr-urls">
                    <div className="dashboard__qr-url"><label>Active URL</label><code>{getPublicMenuUrl()}</code></div>
                  </div>
                  {copyStatus ? <p className="dashboard__toast">{copyStatus}</p> : null}
                  <div className="dashboard__qr-actions">
                    <a className="dashboard__menu-link" href={`/m/${restaurantSlug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} /> Open Menu
                    </a>
                    <Button onClick={downloadMainPng}>Download PNG</Button>
                    <Button onClick={downloadMainSvg}>Download SVG</Button>
                    <Button variant="ghost" onClick={copyMenuLink}><Copy size={16} /> Copy Link</Button>
                  </div>
                  <section className="dashboard__tables">
                    <h3>Tables</h3>
                    <div className="dashboard__table-controls">
                      <Input min={1} max={50} type="number" value={tableCount} onChange={(e) => {
                        let val = e.target.value;
                        if (val.length > 1 && val.startsWith('0')) {
                          val = val.replace(/^0+/, '');
                          if (val === '') val = '0';
                        }
                        setTableCount(val === '' ? '' : Number(val));
                      }} aria-label="Number of tables" />
                      <Button onClick={generateTableQrs}>Generate Table QRs</Button>
                    </div>
                    {generatedTables.length ? (
                      <div className="dashboard__table-qr-grid">
                        {generatedTables.map((table) => (
                          <article className="dashboard__table-qr-card" key={table}>
                            <h4>Table {table}</h4>
                            <QRCodeCanvas id={`table-qr-${table}`} value={getPublicMenuUrl(table)} size={112} level="H" includeMargin />
                            <button className="dashboard__small-download" type="button" onClick={() => downloadCanvas(document.querySelector(`#table-qr-${table}`), `menvo-qr-${restaurantSlug}-table-${table}.png`)}>
                              Download PNG
                            </button>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </section>
                </>
              ) : (
                <div className="dashboard__empty">
                  <UtensilsCrossed size={64} className="dashboard__empty-svg" />
                  <h2>No Restaurant Selected</h2>
                  <p>Create a restaurant first to generate a QR code.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <section className="dashboard__panel">
            <div className="dashboard__panel-head"><h2>Restaurant Settings</h2></div>
            <form className="dashboard__form" onSubmit={settingsForm.handleSubmit(saveSettings)}>
              <Input placeholder="Restaurant name" {...settingsForm.register('restaurantName')} />
              {settingsForm.formState.errors.restaurantName ? <p className="dashboard__form-error">{settingsForm.formState.errors.restaurantName.message}</p> : null}
              <textarea className="dashboard__textarea" placeholder="Bio / description" maxLength={300} {...settingsForm.register('restaurantBio')} />
              {settingsForm.formState.errors.restaurantBio ? <p className="dashboard__form-error">{settingsForm.formState.errors.restaurantBio.message}</p> : null}
              <Input placeholder="Address" {...settingsForm.register('address')} />
              <select className="dashboard__select" {...settingsForm.register('currency')}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <Input placeholder="Logo URL" {...settingsForm.register('logoUrl')} />
              {saveStatus ? <p className="dashboard__save-status">{saveStatus}</p> : null}
              <Button isLoading={isSaving} type="submit">Save Changes</Button>
              <Button variant="danger" type="button" onClick={() => setDeleteRestaurantOpen(true)}>
                <Trash2 size={16} /> Delete Restaurant
              </Button>
            </form>
          </section>
        )}

        {/* ── Sample mode ── */}
        {sample && activeTab === 'menu' && (
          <>
            <section className="dashboard__stats">
              <div className="dashboard__stat-card"><strong>{defaultTables.length}</strong><span>Tables</span></div>
              <div className="dashboard__stat-card"><strong>{occupied}</strong><span>Customers</span></div>
              <div className="dashboard__stat-card"><strong>{orders}</strong><span>Orders</span></div>
            </section>
            <section className="dashboard__panel">
              <div className="dashboard__panel-head">
                <h2>Floor tables</h2>
                <div className="dashboard__legend">
                  <span><i className="legend-empty" /> Empty</span>
                  <span><i className="legend-scan" /> Scanned</span>
                  <span><i className="legend-order" /> Order</span>
                </div>
              </div>
              <div className="table-grid">
                {defaultTables.map((t) => (
                  <article className={`table-card table-card--${t.status}`} key={t.id}>
                    <strong>{t.id}</strong><span>{t.seats} seats</span><em>{t.label}</em>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={(newTab) => navigate(`/dashboard/${newTab}`)} />

      {/* Restaurant Detail Dialog */}
      {showDialog && selectedRestaurant && (
        <RestaurantDialog restaurant={selectedRestaurant} tables={selectedRestaurant.tables ?? defaultTables} onClose={() => { setShowDialog(false); setSelectedRestaurant(null) }} />
      )}

      <ConfirmDialog 
        isOpen={!!categoryToDelete} 
        title="Delete Category" 
        message="Are you sure you want to delete this category and all its menu items? This action cannot be undone." 
        onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete)} 
        onCancel={() => setCategoryToDelete(null)} 
        confirmText="Delete Category" 
        isDestructive 
      />

      <ConfirmDialog
        isOpen={deleteRestaurantOpen}
        title="Delete Restaurant"
        message="Are you sure you want to delete this restaurant? This removes its categories and menu items."
        onConfirm={deleteActiveRestaurant}
        onCancel={() => setDeleteRestaurantOpen(false)}
        confirmText="Delete Restaurant"
        isDestructive
      />


    </MobileShell>
  )
}

