import React, { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";

// Bootstrap
import {
  CDBSidebar,
  CDBSidebarHeader,
  CDBSidebarMenuItem,
  CDBSidebarContent,
  CDBSidebarMenu,
  CDBSidebarSubMenu,
  CDBSidebarFooter
} from 'cdbreact';


// 사이드바 컴포넌트
function IceSidebar() {
    const [toggle, setToggle] = useState(false);

    // 사이즈가 작으면 토글 닫기
    useEffect(() => {
      if(window.innerWidth < 720) {
        setToggle(true);
      }
    }, []);
  

    return (
      <div
      className={`app`}
      style={{ display: 'flex', height: '100vh',
      overflow: 'scroll initial' }}>
      <CDBSidebar textColor="#fff" backgroundColor="#333" toggled={toggle}>
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large" />}>
          Forensics Tools
        </CDBSidebarHeader>
        <CDBSidebarContent>
          <CDBSidebarMenu>
            <NavLink
              to="/appExifAnalyzer"
            >
              <CDBSidebarMenuItem icon="image" iconSize="lg">
                ExifAnalyzer
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink
              to="/more"
            >
              <CDBSidebarMenuItem icon="sticky-note" iconSize="lg">
                More
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>
        <CDBSidebarFooter style={{ textAlign: 'center' }}>
          <div
            className="sidebar-btn-wrapper"
            style={{padding: '20px 5px'}}
          >
          Kyun
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
      </div>
    )
}


export default IceSidebar;