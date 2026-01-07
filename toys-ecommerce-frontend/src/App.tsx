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
import Privacy from './pages/Privacy';

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
import LogisticsTracker from './components/LogisticsTracker';
import TrackingPage from './pages/admin/TrackingPage';

// 🛠️ REFINED CUSTOMER LAYOUT: Prevents content from sliding under the header
const CustomerLayout = () => (
    <div className="flex flex-col min-h-screen">
        <DeliveryBanner />
        <Header />
        {/* main container ensures vertical flow and proper spacing for child pages */}
        <main className="flex-grow bg-white">
            <Outlet />
        </main>
        <Footer />
    </div>
);

// 🛡️ PROTECTED ROUTE GUARD
const ProtectedRoute = ({ token, children }: { token: string | null, children: React.ReactNode }) => {
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const CompareContainer = () => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    if (compareList.length === 0) return null;
    return <CompareDrawer products={compareList} onClose={clearCompare} onRemove={removeFromCompare} />;
};

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));

    const validateToken = useCallback((t: string | null) => {
        if (!t || t === "null" || t === "undefined" || t.trim() === "" || t.length < 20) {
            return null;
        }
        return t;
    }, []);

    useEffect(() => {
        const syncAuth = () => {
            const currentToken = localStorage.getItem('jwtToken');
            setToken(validateToken(currentToken));
        };

        window.addEventListener('user-login', syncAuth);
        window.addEventListener('storage', syncAuth);
        
        return () => {
            window.removeEventListener('user-login', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, [validateToken]);

    const activeToken = validateToken(token);
    
    return (
        <CompareProvider>
            <Router>
                {/* Global Wrapper: Ensures no horizontal overflow or hidden layers */}
                <div className="min-h-screen bg-white">
                    <Routes>
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
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/payment" element={<Payment />} />
                            <Route path="/products" element={<ProductListing />} />
                            
                            {/* Protected Routes */}
                            <Route path="/cart" element={<ProtectedRoute token={activeToken}><Cart /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute token={activeToken}><Checkout /></ProtectedRoute>} />
                            <Route path="/order-success" element={<ProtectedRoute token={activeToken}><OrderSuccess /></ProtectedRoute>} />
                            <Route path="/orders" element={<ProtectedRoute token={activeToken}><MyOrders /></ProtectedRoute>} />
                            <Route path="/wishlist" element={<ProtectedRoute token={activeToken}><Wishlist /></ProtectedRoute>} />

                            <Route path="/quiz" element={<ProtectedRoute token={activeToken}><QuizPage /></ProtectedRoute>} />
                            <Route path="/leaderboard" element={<ProtectedRoute token={activeToken}><Leaderboard /></ProtectedRoute>} />

                            <Route path="/profile" element={<ProtectedRoute token={activeToken}><Profile /></ProtectedRoute>}>
                                <Route index element={<OrderHistory />} /> 
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="details" element={<UserDetails />} />
                                <Route path="rewards" element={<RewardTracker />} />
                                <Route path="addresses" element={<SavedAddresses />} />
                                <Route path="quiz" element={<QuizPage />} />
                                <Route path="track/:id" element={<TrackingPage />} />
                            </Route>
                        </Route>

                        {/* 🛡️ ADMIN ROUTES */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin/orders" element={<AdminDashboard />} />
                                <Route path="/admin/inventory" element={<Inventory />} />
                                <Route path="/admin/add-product" element={<AddProduct />} />
                                <Route path="/admin/logistics-summary" element={<LogisticsSummary />} />
                                <Route path="/admin/shipments" element={<LogisticsTracker />} />
                            </Route>
                        </Route>

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