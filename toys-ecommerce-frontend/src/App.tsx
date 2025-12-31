import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Layout & Global Components
import Header from './components/Header';
import Footer from './components/Footer';
import DeliveryBanner from './components/DeliveryBanner';
import CompareDrawer from './components/CompareDrawer';
import { CompareProvider, useCompare } from './context/CompareContext';

// Public Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryProducts from './pages/CategoryProducts';
import CollectionProducts from './components/CollectionProducts';
import Collections from './components/Collections';
import FeaturedProducts from './pages/FeaturedProducts';
import AgeProductList from './pages/AgeProductList';
import AboutUs from './pages/AboutUs';
import HelpCenter from './pages/HelpCenter';

// Auth & User Pages
import Login from './pages/Login';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import UserDetails from './pages/UserDetails';
import SavedAddresses from './pages/SavedAddresses';
import Wishlist from './pages/Wishlist';

// Checkout & Orders Flow
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './components/MyOrders';

// Admin Pages
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import Inventory from './pages/admin/Inventory';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import QuizPage from './pages/QuizPage';
import Leaderboard from './components/Leaderboard';
import RewardTracker from './components/profile/RewardTracker';
import NotFound from './pages/NotFound';
import ProductListing from './components/ProductListing';
import Payment from './components/Payment';
import LogisticsSummary from './components/admin/LogisticsSummary';

// 🛠️ CUSTOMER LAYOUT WRAPPER
const CustomerLayout = () => (
    <>
        <DeliveryBanner />
        <Header />
        <main className="flex-grow w-full">
            <Outlet />
        </main>
        <Footer />
    </>
);

const CompareContainer = () => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    if (compareList.length === 0) return null;
    return <CompareDrawer products={compareList} onClose={clearCompare} onRemove={removeFromCompare} />;
};

const App: React.FC = () => {
    // ✨ CHANGE: Use state for token to make the routes reactive
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));

    /**
     * ✨ Robust Token Validation
     * Handles 'ghost' tokens and stringified nulls.
     */
    const validateToken = useCallback((t: string | null) => {
        if (!t || t === "null" || t === "undefined" || t.trim() === "" || t.length < 20) {
            return null;
        }
        return t;
    }, []);

    /**
     * ✨ Auth Sync Effect
     * Listens for the 'user-login' event from Login.tsx to unlock routes instantly.
     */
    useEffect(() => {
        const syncAuth = () => {
            const currentToken = localStorage.getItem('jwtToken');
            setToken(validateToken(currentToken));
        };

        window.addEventListener('user-login', syncAuth);
        window.addEventListener('storage', syncAuth); // Handles login across multiple tabs
        
        return () => {
            window.removeEventListener('user-login', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, [validateToken]);

    const activeToken = validateToken(token);
    
    return (
        <CompareProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-gray-50 w-full">
                    <Routes>
                        {/* 🛒 SHOPPER ROUTES (With Header/Footer) */}
                        <Route element={<CustomerLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/products/category/:categoryRoute" element={<CategoryProducts />} />
                            <Route path="/products/collection/:collectionRoute" element={<CollectionProducts />} />
                            <Route path="/collection/:collectionRoute" element={<CollectionProducts />} />
                            <Route path="/collections/age/:ageRange" element={<Collections />} />
                            <Route path="/products/age/:ageId" element={<AgeProductList />} />
                            <Route path="/products/features" element={<FeaturedProducts />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/help" element={<HelpCenter />} />
                            <Route path="/payment" element={<Payment />} />
                            <Route path="/products" element={<ProductListing />} />
                            
                            {/* ✨ Reactive Protected Features */}
                            <Route path="/cart" element={activeToken ? <Cart /> : <Navigate to="/login" replace />} />
                            <Route path="/checkout" element={activeToken ? <Checkout /> : <Navigate to="/login" replace />} />
                            <Route path="/order-success" element={activeToken ? <OrderSuccess /> : <Navigate to="/login" replace />} />
                            <Route path="/orders" element={activeToken ? <MyOrders /> : <Navigate to="/login" replace />} />
                            <Route path="/wishlist" element={activeToken ? <Wishlist /> : <Navigate to="/login" replace />} />

                            <Route path="/quiz" element={activeToken ? <QuizPage /> : <Navigate to="/login" replace />} />
                            <Route path="/leaderboard" element={activeToken ? <Leaderboard /> : <Navigate to="/login" replace />} />

                            <Route path="/profile" element={activeToken ? <Profile /> : <Navigate to="/login" replace />}>
                                <Route index element={<OrderHistory />} /> 
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="details" element={<UserDetails />} />
                                <Route path="rewards" element={<RewardTracker />} />
                                <Route path="addresses" element={<SavedAddresses />} />
                                <Route path="quiz" element={<QuizPage />} />
                            </Route>
                        </Route>

                        {/* 🛡️ ADMIN ROUTES */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin/orders" element={<AdminDashboard />} />
                                <Route path="/admin/inventory" element={<Inventory />} />
                                <Route path="/admin/add-product" element={<AddProduct />} />
                                <Route path="/admin/logistics-summary" element={<LogisticsSummary />} />
                            </Route>
                        </Route>

                        {/* 🔐 AUTH PAGES
                            If logged in, prevent access to login page.
                        */}
                        <Route path="/login" element={activeToken ? <Navigate to="/" replace /> : <Login />} />
                        <Route path="/admin/login" element={activeToken ? <Navigate to="/admin/orders" replace /> : <AdminLogin />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>

                    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
                    <CompareContainer />
                </div>
            </Router>
        </CompareProvider>
    );
};

export default App;