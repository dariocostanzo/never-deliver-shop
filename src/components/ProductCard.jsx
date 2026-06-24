import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { StarRating } from './StarRating';
import { getProductImageSrc, handleProductImageError } from '../lib/imageUtils';

export default function ProductCard({ product }) {
  const { addItem, openDrawer } = useCart();
  const { formatCurrency } = useLocale();
  const [btnAnim, setBtnAnim] = useState(false);
  const [added, setAdded] = useState(false);

  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setBtnAnim(true);
    setAdded(true);
    setTimeout(() => setBtnAnim(false), 450);
    setTimeout(() => {
      setAdded(false);
      openDrawer();
    }, 800);
  }, [addItem, openDrawer, product]);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative bg-gray-50 flex items-center justify-center h-44 sm:h-52 p-4">
        <img
          src={getProductImageSrc(product)}
          alt={product.title}
          className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(event) => handleProductImageError(event, product)}
        />
        <div className="absolute top-2 left-2 bg-[#0077b8] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
          Plus FREE delivery
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-xs text-gray-700 uppercase tracking-wide">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-[#c7511f]">
          {product.title}
        </h3>

        <StarRating rating={product.rating?.rate ?? 4} count={product.rating?.count} />

        {isLowStock && (
          <span className="text-xs font-semibold text-red-600">Only 3 left in stock!</span>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="min-w-0">
            <span className="block text-xl font-bold text-gray-900 truncate">{formatCurrency(product.price)}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`h-9 w-28 self-end shrink-0 inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold rounded-full transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ff9900] cursor-pointer
              ${added
                ? 'bg-green-500 text-white scale-95'
                : 'bg-[#ff9900] hover:bg-[#e88b00] text-[#131921]'
              }
              ${btnAnim ? 'animate-btn-bounce' : ''}
            `}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
