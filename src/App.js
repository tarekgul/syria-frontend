import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DiscoverPage from './DiscoverPage';
import AdminPage from './AdminPage';
import PlaceDetails from './PlaceDetails';
import Register from './Register';
import Login from './Login';
import PlanTripPage from './PlanTripPage';
import MyTripsPage from './MyTripsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/place/:slug" element={<PlaceDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/plan" element={<PlanTripPage/>} />
      <Route path="/mytrips" element={<MyTripsPage />} />

    </Routes>
  );
}

export default App;
