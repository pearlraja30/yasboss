import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // 1. Get the primary token and role string
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');

    // 2. Validate against both possible string formats
    // We check if the role exists and matches our Admin identifiers
    const isAdmin = token && (role === 'ROLE_ADMIN' || role === 'ADMIN');

    // 📝 Debugging log (Remove after verification)
    console.log("AdminRoute Guard - Role found:", role, "Access:", isAdmin ? "GRANTED" : "DENIED");

    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;