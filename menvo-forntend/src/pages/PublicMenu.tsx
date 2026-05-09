import { AnimatePresence } from 'framer-motion'
import { LayoutGrid, SearchX, ShoppingBag } from 'lucide-react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CategorySidebar } from '../components/menu/CategorySidebar'
import { ItemDialog } from '../components/menu/ItemDialog'
import { ItemsGrid } from '../components/menu/ItemsGrid'
import { MenuHeader } from '../components/menu/MenuHeader'
import { SearchBar } from '../components/menu/SearchBar'
import { MobileShell } from '../components/layout/MobileShell'
import { useActiveCategoryObserver } from '../hooks/useActiveCategoryObserver'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useMenu } from '../hooks/useMenu'
import { restaurantApi } from '../services/api'
import type { MenuItem } from '../types/menu'
import './PublicMenu.css'

export function PublicMenu({ sample = false }: { sample?: boolean }) {
  const { slug = 'demo', tableId } = useParams()
  const contentRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [currencyInitialized, setCurrencyInitialized] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 300)
  const { data, error, isLoading } = useMenu(slug, { sample })
  const categories = useMemo(() => data?.categories ?? [], [data])
  const [activeCategoryId, setActiveCategoryId] = useActiveCategoryObserver(contentRef, categories)

  // Set currency from restaurant data once loaded
  useEffect(() => {
    if (data?.currency && !currencyInitialized) {
      setCurrency(data.currency)
      setCurrencyInitialized(true)
    }
  }, [data, currencyInitialized])

  useEffect(() => {
    if (!sample && tableId && slug !== 'demo') {
      restaurantApi.scanTableQr(slug, tableId).catch(console.error)
    }
  }, [slug, tableId, sample])

  // Conversion rates (in production, fetch from an API)
  const conversionRates: Record<string, number> = { USD: 1, INR: 83.5, EUR: 0.92 }
  const currentConversionRate = conversionRates[currency] || 1

  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return []
    return categories
      .flatMap((category) => category.items)
      .filter((item) =>
        [item.name, item.description, item.weight]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(debouncedQuery)),
      )
  }, [categories, debouncedQuery])

  function scrollToCategory(id: string) {
    setActiveCategoryId(id)
    contentRef.current?.querySelector(`#cat-${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <MobileShell variant="surface">
        <div className="public-menu">
          <main className="public-menu__search-results">
            <EmptyState title="Loading menu" subtext="Please wait a moment." />
          </main>
        </div>
      </MobileShell>
    )
  }

  if (!data) {
    return (
      <MobileShell variant="surface">
        <div className="public-menu">
          <main className="public-menu__search-results">
            <EmptyState title={error || 'Menu could not be loaded'} />
          </main>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell variant="surface">
      <div className="public-menu">
        <MenuHeader menu={data} tableId={tableId} currency={currency} onCurrencyChange={setCurrency} />
        <SearchBar value={query} onChange={setQuery} />
        {error ? <p className="public-menu__notice">{error}</p> : null}
        {!categories.length ? (
          <EmptyState icon="category" title="No categories yet" subtext="This menu is being prepared." />
        ) : debouncedQuery ? (
          <main className="public-menu__search-results">
            {filteredItems.length ? (
              <ItemsGrid items={filteredItems} onItemClick={setSelectedItem} currency={currency} conversionRate={currentConversionRate} />
            ) : (
              <EmptyState title="No items found" />
            )}
          </main>
        ) : (
          <div className="public-menu__body">
            <CategorySidebar
              activeId={activeCategoryId || categories[0]?.id}
              categories={categories}
              onSelect={scrollToCategory}
            />
            <main className="public-menu__content" ref={contentRef}>
              {categories.map((category) => (
                <section
                  className="public-menu__section"
                  data-category-id={category.id}
                  id={`cat-${category.id}`}
                  key={category.id}
                >
                  <h2><span>{category.icon || category.emoji || '🍽️'}</span>{category.name}</h2>
                  {category.items.length ? (
                    <ItemsGrid items={category.items} onItemClick={setSelectedItem} currency={currency} conversionRate={currentConversionRate} />
                  ) : (
                    <EmptyState icon="items" title="No items yet" subtext="Items will appear here soon." compact />
                  )}
                </section>
              ))}
            </main>
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedItem ? <ItemDialog item={selectedItem} currency={currency} conversionRate={currentConversionRate} onClose={() => setSelectedItem(null)} /> : null}
      </AnimatePresence>
    </MobileShell>
  )
}

function EmptyState({ title, subtext, icon = 'search', compact = false }: { title: string; subtext?: string; icon?: 'search' | 'category' | 'items'; compact?: boolean }) {
  const Icon = icon === 'category' ? LayoutGrid : icon === 'items' ? ShoppingBag : SearchX
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <Icon size={compact ? 48 : 64} />
      <p>{title}</p>
      {subtext ? <span>{subtext}</span> : null}
    </div>
  )
}
