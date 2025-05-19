import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Planes from './pages/Planes';
import Flights from './pages/Flights';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;