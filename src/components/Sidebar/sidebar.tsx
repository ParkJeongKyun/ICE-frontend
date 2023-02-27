import { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";

// Bootstrap
import {
  CDBSidebar,
  CDBSidebarHeader,
  CDBSidebarMenuItem,
  CDBSidebarContent,
  CDBSidebarMenu,
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
        overflow: 'scroll initial' }}
      >
        <CDBSidebar className="" breakpoint={0} minWidth="" maxWidth="" textColor="#fff" backgroundColor="#345" toggled={toggle}>
          <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large" />}>
            ICE forensics
          </CDBSidebarHeader>
          <CDBSidebarContent>
            <CDBSidebarMenu>
              <NavLink
                to="/appExifAnalyzer"
              >
                <CDBSidebarMenuItem icon="image" iconSize="lg">
                  이미지 EXIF 분석
                </CDBSidebarMenuItem>
              </NavLink>
              <NavLink
                to="/more"
              >
                <CDBSidebarMenuItem icon="sticky-note" iconSize="lg">
                  더보기
                </CDBSidebarMenuItem>
              </NavLink>
            </CDBSidebarMenu>
          </CDBSidebarContent>
          <CDBSidebarFooter>
          </CDBSidebarFooter>
        </CDBSidebar>
      </div>
    );
}


export default IceSidebar;