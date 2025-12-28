import React from 'react';
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
import FeaturedProducts from './components/FeaturedProducts';
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
    // ✨ ADDED: Retrieve user and token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('jwtToken'); // Fixed: Define missing token
    
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
                            
                            {/* Public Listing - Allows Guest Browsing */}
                            <Route path="/products" element={<ProductListing />} />
                            
                            {/* Protected Customer Features */}
                            <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
                            <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
                            <Route path="/order-success" element={token ? <OrderSuccess /> : <Navigate to="/login" />} />
                            <Route path="/orders" element={token ? <MyOrders /> : <Navigate to="/login" />} />
                            <Route path="/wishlist" element={token ? <Wishlist /> : <Navigate to="/login" />} />

                            {/* Quiz & Leaderboard - Protected */}
                            <Route path="/quiz" element={token ? <QuizPage /> : <Navigate to="/login" />} />
                            <Route path="/leaderboard" element={token ? <Leaderboard /> : <Navigate to="/login" />} />

                            {/* User Profile - Protected */}
                            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />}>
                                <Route index element={<OrderHistory />} /> 
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="details" element={<UserDetails />} />
                                <Route path="rewards" element={<RewardTracker />} />
                                <Route path="addresses" element={<SavedAddresses />} />
                            </Route>
                        </Route>

                        {/* 🛡️ ADMIN ROUTES */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin/orders" element={<AdminDashboard />} />
                                <Route path="/admin/inventory" element={<Inventory />} />
                                <Route path="/admin/add-product" element={<AddProduct />} />
                            </Route>
                        </Route>

                        {/* AUTH PAGES */}
                        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
                        <Route path="/admin/login" element={<AdminLogin />} />

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