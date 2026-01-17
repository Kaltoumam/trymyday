import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { WalletProvider } from './context/WalletContext';
import { LanguageProvider } from './context/LanguageContext';

import Navigation from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Shop from './pages/Shop';
import Help from './pages/Help';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Register from './pages/Register';
import Addresses from './pages/Addresses';
import Cards from './pages/Cards';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';

import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import UserInfo from './pages/UserInfo';
import Reorder from './pages/Reorder';
import Coupons from './pages/Coupons';
import Messages from './pages/Messages';
import Wallet from './pages/Wallet';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import { AdminOrders, AdminSupport } from './pages/admin/AdminViews';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFinance from './pages/admin/AdminFinance';
import AdminWalletManagement from './pages/admin/AdminWalletManagement';

const NotFound = () => <div className="container mt-5"><h2>Page non trouvée</h2><Link to="/">Retour Accueil</Link></div>;

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <DataProvider>
                    <CartProvider>
                        <FavoritesProvider>
                            <WalletProvider>
                                <Router>
                                    <ScrollToTop />
                                    <div className="min-vh-100 d-flex flex-column">
                                        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
                                        <Navigation />
                                        <main className="flex-grow-1">
                                            <Routes>
                                                {/* Public Routes */}
                                                <Route path="/" element={<Home />} />
                                                <Route path="/shop" element={<Shop />} />
                                                <Route path="/product/:id" element={<ProductDetails />} />
                                                <Route path="/help" element={<Help />} />
                                                <Route path="/cart" element={<Cart />} />
                                                <Route path="/checkout" element={<Checkout />} />
                                                <Route path="/favorites" element={<Favorites />} />
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/register" element={<Register />} />

                                                {/* Profile Routes */}
                                                <Route path="/profile" element={<Profile />} />
                                                <Route path="/profile/info" element={<UserInfo />} />
                                                <Route path="/profile/orders" element={<Orders />} />
                                                <Route path="/profile/orders/:orderId" element={<OrderDetails />} />
                                                <Route path="/profile/addresses" element={<Addresses />} />
                                                <Route path="/profile/cards" element={<Cards />} />
                                                <Route path="/profile/reorder" element={<Reorder />} />
                                                <Route path="/profile/coupons" element={<Coupons />} />
                                                <Route path="/profile/messages" element={<Messages />} />
                                                <Route path="/profile/wallet" element={<Wallet />} />

                                                {/* Admin Routes */}
                                                <Route path="/admin" element={<AdminLayout />}>
                                                    <Route index element={<AdminDashboard />} />
                                                    <Route path="products" element={<AdminProducts />} />
                                                    <Route path="orders" element={<AdminOrders />} />
                                                    <Route path="users" element={<AdminUsers />} />
                                                    <Route path="finance" element={<AdminFinance />} />
                                                    <Route path="wallet" element={<AdminWalletManagement />} />
                                                    <Route path="support" element={<AdminSupport />} />
                                                </Route>

                                                <Route path="*" element={<NotFound />} />
                                            </Routes>
                                        </main>
                                        <footer className="bg-dark text-white py-2 mt-4 text-center">
                                            <div className="container">
                                                <p className="mb-0" style={{ fontSize: '0.7rem', opacity: 0.7 }}>&copy; 2025 TRYMYDAY. Tous droits réservés.</p>
                                            </div>
                                        </footer>
                                    </div>
                                </Router>
                            </WalletProvider>
                        </FavoritesProvider>
                    </CartProvider>
                </DataProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
