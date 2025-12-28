import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Check for the ROLE we set in our SQL sample data
    return user && user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/login" />;
};
export default AdminRoute;