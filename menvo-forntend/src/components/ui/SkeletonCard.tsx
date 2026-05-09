import './SkeletonCard.css'

export function SkeletonCard() {
  return (
    <article className="skeleton-card" aria-label="Loading item">
      <div className="skeleton-card__image" />
      <div className="skeleton-card__line skeleton-card__line--wide" />
      <div className="skeleton-card__line" />
      <div className="skeleton-card__line skeleton-card__line--short" />
      <div className="skeleton-card__line skeleton-card__line--price" />
    </article>
  )
}
