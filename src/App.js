import React from 'react';
import './styles/App.css';
//for Routing
import { HashRouter, BrowserRouter, Routes, Route} from "react-router-dom";
import { Link, NavLink} from "react-router-dom";

//Bootstrap
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

//Application Component
import MainPage from "./components/mainPage";
import AppExifAnalyzer from "./components/appExifAnalyzer";

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
        <Container>
          <Routes>
            <Route path="/" element={<MainPage/>} />
            <Route path="/appExifAnalyzer" element={<AppExifAnalyzer/>} />
          </Routes>
        </Container>
      </HashRouter>
  );
}

export default App;