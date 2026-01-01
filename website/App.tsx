import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomeView from './views/HomeView';
import FeaturesView from './views/FeaturesView';
import QuickAccessView from './views/QuickAccessView';
import WikiView from './views/WikiView';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/features" element={<FeaturesView />} />
            <Route path="/access" element={<QuickAccessView />} />
            <Route path="/wiki" element={<WikiView />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
