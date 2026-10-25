import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Search from './pages/Search.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import CartPage from './pages/CartPage.jsx';
import { Layout, SimpleLayout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Catalog />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
      </Route>

      <Route element={<SimpleLayout />}>
        <Route path="/product/:id" element={<Product />} />
        <Route path="/search" element={<Search />} />
      </Route>

      <Route path="/admin/*" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
