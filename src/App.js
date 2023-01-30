import React from 'react';
import './styles/App.css';

// for Routing
import { HashRouter, Routes, Route } from "react-router-dom";

// Bootstrap
// import Container from 'react-bootstrap/Container';
// import { Snow, Mailbox, PostcardFill } from 'react-bootstrap-icons';

// Component
import IceNavbar from './components/Navbar/navbar';
import IceSidebar from './components/Sidebar/sidebar';

// Application Component
import AppExifAnalyzer from "./components/ExifAnalyzer/appExifAnalyzer";
import More from "./components/More/more";

// For TEST
import Test from "./components/Test/test"

// 메인 앱
function App() {
  return (
    <HashRouter>
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
                {/* <Route path="/" element={<MainPage/>}/> */}
                {/* <Route path="/" element={<AppExifAnalyzer/>}/> */}
                <Route path="/" element={<Test/>}/>
                <Route path="/more" element={<More/>} />
                <Route path="/appExifAnalyzer" element={<AppExifAnalyzer/>} />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;