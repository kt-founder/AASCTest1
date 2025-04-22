import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAuthenticated, guestOnly }) => {
    if (guestOnly && isAuthenticated) {
        // Nếu là guest-only route nhưng user đã đăng nhập, chuyển hướng về trang chính
        return <Navigate to="/" replace />;
    }

    if (!guestOnly && !isAuthenticated) {
        // Nếu là protected route nhưng user chưa đăng nhập, chuyển hướng đến login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
