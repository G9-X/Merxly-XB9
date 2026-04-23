import { Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { HomePage } from './pages/Home';
import {
  SearchProductPage,
  ProductDetailPage,
  CartPage,
  WishlistPage,
  CheckoutPage,
  OrderConfirmationPage,
  OrderHistoryPage,
  CustomerOrderDetailPage,
} from './pages/Customer';
import {
  DashboardPage,
  UserProfilePage,
  PaymentMethodsPage,
  AddressesPage,
} from './pages/User';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { StoreOwnerLayout } from './components/layout';
import { AdminLayout } from './components/layout/admin';
import {
  CustomerLayout,
  UserAccountLayout,
} from './components/layout/customer';
import {
  StoreHomePage,
  StoreOrdersPage,
  StoreOrderDetailPage,
  StoreProductsPage,
  StoreSettingsPage,
} from './pages/Store';
import {
  AdminDashboardPage,
  AdminCategoriesPage,
  AdminStoresPage,
  AdminUsersPage,
  AdminStoreVerificationPage,
} from './pages/Admin';
import { CreateProductPage } from './pages/Store/CreateProductPage';
import { UserRole } from './types/enums';
import { StoreLocationsPage } from './pages/Store/StoreLocationsPage';
import { StorePaymentsPage } from './pages/Store/StorePaymentsPage';
import { StoreMyStorePage } from './pages/Store/StoreMyStorePage';
import { SignUpNewStorePage } from './pages/SignUpNewStorePage';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

function App() {
  return (
    <>
      <Routes>
        {/* Admin Routes with Layout */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute requiredRoles={[UserRole.Admin]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path='categories' element={<AdminCategoriesPage />} />
          <Route path='stores/all' element={<AdminStoresPage />} />
          <Route
            path='stores/verification'
            element={<AdminStoreVerificationPage />}
          />
          <Route path='users' element={<AdminUsersPage />} />
        </Route>

        {/* Store Owner Routes with Layout */}
        <Route
          path='/store'
          element={
            <ProtectedRoute requiredRoles={[UserRole.StoreOwner]}>
              <StoreOwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StoreHomePage />} />
          <Route path='orders' element={<StoreOrdersPage />} />
          <Route path='orders/:subOrderId' element={<StoreOrderDetailPage />} />
          <Route path='products' element={<StoreProductsPage />} />
          <Route path='locations' element={<StoreLocationsPage />} />
          <Route path='payments' element={<StorePaymentsPage />} />
          <Route path='my-store' element={<StoreMyStorePage />} />
          <Route path='settings' element={<StoreSettingsPage />} />{' '}
        </Route>

        {/* Create Product Route - Without Layout */}
        <Route
          path='/store/products/new'
          element={
            <ProtectedRoute requiredRoles={[UserRole.StoreOwner]}>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />

        {/* Edit Product Route - Without Layout */}
        <Route
          path='/store/products/:id'
          element={
            <ProtectedRoute requiredRoles={[UserRole.StoreOwner]}>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes with Layout */}
        <Route path='/' element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path='/login'
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path='/register'
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path='/forgot-password'
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route path='search' element={<SearchProductPage />} />
          <Route path='products/:id' element={<ProductDetailPage />} />
          <Route
            path='sign-up-new-store'
            element={
              <ProtectedRoute>
                <SignUpNewStorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path='cart'
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='wishlist'
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='checkout'
            element={
              <Elements stripe={stripePromise}>
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              </Elements>
            }
          />
          <Route
            path='order-confirmation'
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />

          {/* User Account Routes with Sidebar Layout */}
          <Route
            path='user-account'
            element={
              <ProtectedRoute>
                <UserAccountLayout />
              </ProtectedRoute>
            }
          >
            <Route path='dashboard' element={<DashboardPage />} />
            <Route path='profile' element={<UserProfilePage />} />
            <Route path='addresses' element={<AddressesPage />} />
            <Route path='payment-methods' element={<PaymentMethodsPage />} />
            <Route path='order-history' element={<OrderHistoryPage />} />
            <Route
              path='order-history/:subOrderId'
              element={<CustomerOrderDetailPage />}
            />
          </Route>
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  );
}

export default App;
