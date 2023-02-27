import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';

// Component
import IceNavbar from 'components/Navbar/navbar';
import IceSidebar from 'components/Sidebar/sidebar';

// Page
import Main from 'page/Main';
import AppExifAnalyzer from 'page/AppExifAnalyzer';
import More from 'page/More';

// Style
import 'styles/App.css';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <IceSidebar/>
      <div className="d-flex flex-column w-100"
      style={{display: 'flex', height: '100vh', overflow:"auto"}}
      >
        <IceNavbar/>
        <div className="main-container container-fluid pt-3"
        style={{display: 'flex', height: '100vh', overflowY:"scroll"}}
        >
          <div className="ice_container w-100">
          <Routes>
            <Route path="/" element={<AppExifAnalyzer/>} />
            <Route path="/appExifAnalyzer" element={<AppExifAnalyzer/>} />
            <Route path="/more" element={<More/>} />
          </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
