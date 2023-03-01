// Bootstrap
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from "react-router-dom";

// 네비게이션바 컴포넌트
function IceNavbar() {
  return (
    <Navbar style={{background: "#345", color: "#FFF", height:"75px"}}>
      <div className="d-flex p-3 w-100 justify-content-between align-items-center">
        <Navbar.Brand className="text-white" as={Link} to="/">
            <img
            src="logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
            />
            &nbsp;ICE
        </Navbar.Brand>
        <div className="d-flex ml-auto nav_info"><span className="text-secondary">&copy; Jeongkyun-Park. dbzoseh84@gmail.com</span></div>
      </div>
    </Navbar>
  );
}


export default IceNavbar;