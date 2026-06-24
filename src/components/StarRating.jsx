export function StarRating({ rating, count, onReviewClick }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex text-[#c77800]" aria-hidden="true">
        {Array.from({ length: full }).map((_, i) => (
          <span key={`f${i}`}>★</span>
        ))}
        {half && <span>½</span>}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={`e${i}`} className="text-gray-500">★</span>
        ))}
      </div>
      {count !== undefined && (
        onReviewClick ? (
          <button
            type="button"
            onClick={onReviewClick}
            className="text-xs text-blue-800 hover:underline cursor-pointer"
            aria-label="Open customer reviews"
          >
            ({count.toLocaleString()})
          </button>
        ) : (
          <span className="text-xs text-blue-800 hover:underline cursor-pointer">
            ({count.toLocaleString()})
          </span>
        )
      )}
    </div>
  );
}
