import { useTranslation } from 'react-i18next';

/**
 * Demo component showing all available translations
 * Use this to test and preview translations
 */
export default function LanguageDemo() {
  const { t, i18n } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-dark-brown mb-2">
          Translation Demo
        </h2>
        <p className="text-gray-600">
          Current Language: <span className="font-semibold">{i18n.language === 'en' ? 'English' : 'മലയാളം'}</span>
        </p>
      </div>

      <div className="space-y-6">
        {/* Navigation */}
        <section className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-cream rounded">{t('nav.home')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.products')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.timber')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.furniture')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.construction')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.marketplace')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.cart')}</div>
            <div className="p-2 bg-cream rounded">{t('nav.wishlist')}</div>
          </div>
        </section>

        {/* Products */}
        <section className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 bg-cream rounded">{t('products.addToCart')}</div>
            <div className="p-2 bg-cream rounded">{t('products.addToWishlist')}</div>
            <div className="p-2 bg-cream rounded">{t('products.inStock')}</div>
            <div className="p-2 bg-cream rounded">{t('products.outOfStock')}</div>
            <div className="p-2 bg-cream rounded">{t('products.price')}</div>
            <div className="p-2 bg-cream rounded">{t('products.reviews')}</div>
          </div>
        </section>

        {/* Cart */}
        <section className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Cart</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 bg-cream rounded">{t('cart.title')}</div>
            <div className="p-2 bg-cream rounded">{t('cart.empty')}</div>
            <div className="p-2 bg-cream rounded">{t('cart.subtotal')}</div>
            <div className="p-2 bg-cream rounded">{t('cart.total')}</div>
            <div className="p-2 bg-cream rounded">{t('cart.checkout')}</div>
            <div className="p-2 bg-cream rounded">{t('cart.quantity')}</div>
          </div>
        </section>

        {/* Admin */}
        <section className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Admin</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-cream rounded">{t('admin.dashboard')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.products')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.orders')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.users')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.totalRevenue')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.totalOrders')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.totalProducts')}</div>
            <div className="p-2 bg-cream rounded">{t('admin.totalUsers')}</div>
          </div>
        </section>

        {/* Common */}
        <section className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Common</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-cream rounded">{t('common.search')}</div>
            <div className="p-2 bg-cream rounded">{t('common.filter')}</div>
            <div className="p-2 bg-cream rounded">{t('common.save')}</div>
            <div className="p-2 bg-cream rounded">{t('common.cancel')}</div>
            <div className="p-2 bg-cream rounded">{t('common.delete')}</div>
            <div className="p-2 bg-cream rounded">{t('common.edit')}</div>
            <div className="p-2 bg-cream rounded">{t('common.loading')}</div>
            <div className="p-2 bg-cream rounded">{t('common.success')}</div>
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h3 className="text-xl font-semibold mb-3 text-accent-red">Authentication</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 bg-cream rounded">{t('auth.email')}</div>
            <div className="p-2 bg-cream rounded">{t('auth.password')}</div>
            <div className="p-2 bg-cream rounded">{t('auth.signIn')}</div>
            <div className="p-2 bg-cream rounded">{t('auth.signUp')}</div>
            <div className="p-2 bg-cream rounded">{t('auth.forgotPassword')}</div>
            <div className="p-2 bg-cream rounded">{t('auth.rememberMe')}</div>
          </div>
        </section>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Click the language switcher in the header to see all these translations change instantly!
        </p>
      </div>
    </div>
  );
}
