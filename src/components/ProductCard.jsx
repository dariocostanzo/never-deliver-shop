import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useLanguage } from '../context/LanguageContext';
import { StarRating } from './StarRating';
import { getProductImageSrc, handleProductImageError } from '../lib/imageUtils';
import { SALE_DISCOUNT_PERCENT } from '../lib/sale';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { formatCurrency } = useLocale();
  const { t } = useLanguage();
  const [btnAnim, setBtnAnim] = useState(false);
  const [added, setAdded] = useState(false);

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;
  const onSale = product.onSale && product.originalPrice > product.price;
  const discountPercent = product.discountPercent ?? SALE_DISCOUNT_PERCENT;
  const isLightningDeal = product.isLightningDeal && onSale;

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product);
    setBtnAnim(true);
    setAdded(true);
    setTimeout(() => setBtnAnim(false), 450);
    setTimeout(() => setAdded(false), 800);
  }, [addItem, product, isOutOfStock]);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group h-full bg-white rounded-lg border border-gray-300 hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden"
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
        {isLightningDeal && (
          <div className="absolute top-2 left-2 mt-6 inline-flex items-center gap-1 bg-[#131921] text-[#ff9900] text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow uppercase tracking-wide">
            ⚡ {t('lightningDeal')}
          </div>
        )}
        {onSale && (
          <div className={`absolute top-2 right-2 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-sm shadow ${isLightningDeal ? 'bg-[#b12704]' : 'bg-[#c7511f]'}`}>
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-xs text-gray-700 uppercase tracking-wide">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-[#c7511f]">
          {product.title}
        </h3>

        <StarRating rating={product.rating?.rate ?? 4} count={product.rating?.count} />

        {isOutOfStock ? (
          <span className="text-xs font-semibold text-gray-600">Out of stock</span>
        ) : isLowStock && (
          <span className="text-xs font-semibold text-red-600">Only {product.stock} left in stock!</span>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="min-w-0">
            <span className="block text-xl font-bold text-gray-900 truncate">{formatCurrency(product.price)}</span>
            {onSale && (
              <span className="flex items-baseline gap-1.5 text-xs">
                <span className="text-gray-600 line-through">{formatCurrency(product.originalPrice)}</span>
                <span className={`font-bold ${isLightningDeal ? 'text-[#b12704]' : 'text-[#c7511f]'}`}>-{discountPercent}% {t('off')}</span>
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`h-9 w-28 self-end shrink-0 inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold rounded-full transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#ff9900] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              ${added
                ? 'bg-green-500 text-white scale-95'
                : 'bg-[#ff9900] hover:bg-[#e88b00] text-[#131921]'
              }
              ${btnAnim ? 'animate-btn-bounce' : ''}
            `}
          >
            {isOutOfStock ? 'Sold Out' : added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
