import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import api from './services/api';

// 🔔 Firebase Imports
// import { messaging } from './firebase-config'; 
// import { getToken } from "firebase/messaging";

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
import ReportsPanel from './pages/admin/ReportsPanel';
import AnnouncementManager from './pages/admin/AnnouncementManager';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import AdminSettings from './pages/admin/AdminSettings';
import ShipmentAll from './pages/admin/ShipmentAll';
import OrderTracking from './components/OrderTracking';
import UserOrders from './pages/UserOrders';

// 🛠️ REFINED CUSTOMER LAYOUT
const CustomerLayout = () => (
    <div className="flex flex-col min-h-screen">
        <DeliveryBanner />
        <Header />
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

    const activeToken = validateToken(token);

    /**
     * ✨ FIREBASE PUSH NOTIFICATION LOGIC
     */
    const requestForToken = useCallback(async () => {
        try {
            if (!("Notification" in window)) return;
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log("Notification permission granted.");
                // Add your VAPID key and uncomment when firebase-config is ready
                /*
                const fcmToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
                if (fcmToken) {
                    await api.userService.updateFcmToken(fcmToken);
                }
                */
            }
        } catch (err) {
            console.error("FCM Token Error:", err);
        }
    }, []);

    useEffect(() => {
        if (activeToken) {
            requestForToken();
        }
    }, [activeToken, requestForToken]);

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

    return (
        <CompareProvider>
            <Router>
                <div className="min-h-screen bg-white">
                    <Routes>
                        <Route element={<CustomerLayout />}>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/products" element={<ProductListing />} />
                            <Route path="/products/category/:categoryRoute" element={<CategoryProducts />} />
                            <Route path="/products/collection/:collectionRoute" element={<CollectionProducts />} />
                            <Route path="/collection/:collectionRoute" element={<CollectionProducts />} />
                            <Route path="/collections/age/:ageRange" element={<Collections />} />
                            <Route path="/products/age/:ageId" element={<AgeProductList />} />
                            <Route path="/products/features" element={<FeaturedProducts />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/help" element={<HelpCenter />} />
                            <Route path="/privacy" element={<Privacy />} />
                            
                            {/* Protected Checkout & User Routes */}
                            <Route path="/cart" element={<ProtectedRoute token={activeToken}><Cart /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute token={activeToken}><Checkout /></ProtectedRoute>} />
                            <Route path="/payment" element={<ProtectedRoute token={activeToken}><Payment /></ProtectedRoute>} />
                            <Route path="/order-success" element={<ProtectedRoute token={activeToken}><OrderSuccess /></ProtectedRoute>} />
                            <Route path="/wishlist" element={<ProtectedRoute token={activeToken}><Wishlist /></ProtectedRoute>} />
                            <Route path="/quiz" element={<ProtectedRoute token={activeToken}><QuizPage /></ProtectedRoute>} />
                            <Route path="/leaderboard" element={<ProtectedRoute token={activeToken}><Leaderboard /></ProtectedRoute>} />
                            
                            {/* Tracking & Unified Order Views */}
                            <Route path="/track/:orderId" element={<ProtectedRoute token={activeToken}><OrderTracking /></ProtectedRoute>} />
                            <Route path="/profile/orders" element={<ProtectedRoute token={activeToken}><UserOrders /></ProtectedRoute>} />
                            
                            {/* Nested Profile Routes */}
                            <Route path="/profile" element={<ProtectedRoute token={activeToken}><Profile /></ProtectedRoute>}>
                                <Route index element={<OrderHistory />} /> 
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="details" element={<UserDetails />} />
                                <Route path="rewards" element={<RewardTracker />} />
                                <Route path="addresses" element={<SavedAddresses />} />
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
                                <Route path="/admin/shipments" element={<ShipmentAll />} />
                                <Route path="/admin/reports" element={<ReportsPanel />} />
                                <Route path="/admin/announcements" element={<AnnouncementManager />} />
                                <Route path="/admin/settings" element={<AdminSettings />} />
                            </Route>
                        </Route>

                        {/* Auth Redirects */}
                        <Route path="/login" element={activeToken ? <Navigate to="/" replace /> : <Login />} />
                        <Route path="/admin/login" element={activeToken ? <Navigate to="/admin/orders" replace /> : <AdminLogin />} />
                        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
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