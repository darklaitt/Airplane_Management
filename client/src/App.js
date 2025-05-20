import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';

// Layout компоненты
import Layout from './components/Layout/Layout';

// Страницы
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Planes from './pages/Planes';
import Flights from './pages/Flights';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';

// Компоненты безопасности
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Стили
import './App.css';
import './styles/auth.css';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Защищенные маршруты */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/planes" element={
                <ProtectedRoute requiredPermission="planes:read">
                  <Layout>
                    <Planes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/flights" element={
                <ProtectedRoute requiredPermission="flights:read">
                  <Layout>
                    <Flights />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/tickets" element={
                <ProtectedRoute requiredPermission="tickets:read">
                  <Layout>
                    <Tickets />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute requiredPermission="reports:read">
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Редирект на главную для неизвестных маршрутов */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;