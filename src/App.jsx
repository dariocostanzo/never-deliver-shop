import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { LocaleProvider } from './context/LocaleContext'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import SaleBanner from './components/SaleBanner'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get('q') || ''

  const setSearchValue = (nextValue) => {
    const resolvedValue = typeof nextValue === 'function' ? nextValue(searchValue) : nextValue
    const nextParams = new URLSearchParams(searchParams)
    const normalizedValue = resolvedValue ?? ''

    if (normalizedValue.trim()) {
      nextParams.set('q', normalizedValue)
    } else {
      nextParams.delete('q')
    }

    // Reset paging whenever the search text changes.
    nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded shadow z-50">
        Skip to main content
      </a>
      <Header onSearch={setSearchValue} searchValue={searchValue} />
      <SaleBanner />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage searchValue={searchValue} />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Routes>
      </main>
      <footer className="bg-[#131921] text-gray-300 text-xs text-center py-4">
        © 2026 NeverDeliver · All transactions are fake · No real charges · Just dopamine
      </footer>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <LocaleProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </LocaleProvider>
    </LanguageProvider>
  )
}

export default App
