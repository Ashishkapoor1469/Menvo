
import { useEffect, useState, type RefObject } from 'react'
import type { Category } from '../types/menu'

export function useActiveCategoryObserver(
  contentRef: RefObject<HTMLElement | null>,
  categories: Category[],
) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '')

  useEffect(() => {
    if (!categories.length) {
      return
    }

    const root = contentRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        const id = visible?.target.getAttribute('data-category-id')
        if (id) setActiveCategoryId(id)
      },
      {
        root,
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      },
    )

    categories.forEach((category) => {
      const node = root.querySelector(`#cat-${category.id}`)
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [categories, contentRef])

  return [activeCategoryId, setActiveCategoryId] as const
}
