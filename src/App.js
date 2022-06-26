import React from 'react';
import './styles/App.css';

//for Routing
import { HashRouter, Routes, Route} from "react-router-dom";
import { Link, NavLink} from "react-router-dom";

//Bootstrap
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { Snow, Mailbox } from 'react-bootstrap-icons';

//Application Component
//import MainPage from "./components/mainPage";
import AppExifAnalyzer from "./components/appExifAnalyzer";
import More from "./components/more";


// 메인 앱
function App() {
  return (
      <HashRouter>
        <Navbar expand="sm" bg="dark" variant="dark">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img
                src="logo.png"
                width="30"
                height="30"
                className="d-inline-block align-top"
                alt="React Bootstrap logo"
              />
              ICE
              </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={NavLink} to="/appExifAnalyzer">이미지분석</Nav.Link>
                <Nav.Link as={NavLink} to="/more">더보기</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mt-3">
          <Routes>
            {/* <Route path="/" element={<MainPage/>} /> */}
            <Route path="/" element={<AppExifAnalyzer/>} />
            <Route path="/appExifAnalyzer" element={<AppExifAnalyzer/>} />
            <Route path="/more" element={<More/>} />
          </Routes>
        </Container>
        
        <footer className="footer mt-5 pt-4 text-center bg-dark text-white">
          <Container>
          <h4 className="text-light"><img
                src="logo.png"
                width="30"
                height="30"
                className="d-inline-block align-top"
                alt="React Bootstrap logo"
              />ICE</h4>
            <p>
              Forensic Web Application for Free<br/>
              <span className="text-info"><Mailbox/> dbzoseh84@gmail.com</span><br/>
              <span className="text-secondary">ParkJeongkyun</span><br/>
              <Link className="text-info" to="/more"><Snow/>More</Link>
            </p>
          </Container>
        </footer>
      </HashRouter>
  );
}

export default App;