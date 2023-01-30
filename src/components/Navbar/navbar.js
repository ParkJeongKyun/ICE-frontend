import React, { useState } from 'react';

// Bootstrap
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink } from "react-router-dom";

import { CDBNavbar } from "cdbreact";

import { Snow, Mailbox, PostcardFill } from 'react-bootstrap-icons';


function IceNavbar() {
    return (
          <CDBNavbar expand="md" scrolling className="justify-content-start" style={{background: "#333", color: "#FFF", height:"80px"}}>
            <Container>
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
              <div className="ml-auto nav_info"><span className="text-secondary"><Mailbox/> dbzoseh84@gmail.com</span></div>
              {/* <span className="text-secondary">ParkJeongkyun</span> */}
            </Container>
          </CDBNavbar>
    );
}


export default IceNavbar;