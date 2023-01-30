import React, { useState } from 'react';


// Bootstrap
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Figure from 'react-bootstrap/Figure';

import "../../styles/test.css";

import { Mailbox, PostcardFill } from 'react-bootstrap-icons';

// 이미지 EXIF 분석기 메인 컴포넌트
function Test() {
    return (
        <Deshbord/>
        // <Row>
        //     <Col md={4} className='p-3'><Deshbord/></Col>
        //     <Col md={8} className='p-3'><Deshbord/></Col>
        // </Row>
    )

}


function Deshbord() {
    return (
        <div className="dashboard d-flex w-100">
          <div style={{flex:"1 1 auto", display:"flex", flexFlow:"column", height:"100%", overflowY:"hidden"}}>
                <div style={{height:"100%"}}>
                    <div className="d-flex card-section">
                        <div className="cards-container">

                            <div className="card-bg w-100 border d-flex flex-column p-4" style={{gridRow:"span 2"}}>
                                <div className="d-flex">
                                <h6  className="h5 font-weight-bold text-dark">이미지 정보</h6>
                                <div className="ml-auto rounded-circle bg-grey py-1 px-2"><i className="fas fa-user"></i></div>
                                </div>
                                <div className="d-flex mt-4">
                                <div>
                                    <h6 className="mb-0" style={{fontWeight:"600"}}>Mezue</h6>
                                    <p className="m-0" style={{fontSize:"0.75em"}}>Online</p>
                                </div>         
                                </div>
                                <div className="d-flex mt-4">
                                <div>
                                    <h6 className="mb-0" style={{fontWeight:"600"}}>Mezue</h6>
                                    <p className="m-0" style={{fontSize:"0.75em"}}>Online</p>
                                </div>
                                </div>
                            </div>


                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">시간정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">위치정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">카메라정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">플래시정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">렌즈정보</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                            <div className="card-bg w-100 border d-flex flex-column">
                                <div className="p-4 d-flex flex-column h-100">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="m-0 h5 font-weight-bold text-dark">남는거</h4>
                                    <div className="py-1 px-2 bg-grey rounded-circle"><Mailbox/></div>
                                </div>
                                <h4 className="my-4 text-right text-dark h2 font-weight-bold">1234</h4>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
}

export default Test;