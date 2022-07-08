import React from "react";

// Bootstrap
import { FileEarmarkExcelFill} from 'react-bootstrap-icons';

// EXIF 정보가 없는 경우 보여주는 컴포넌트
function NoExifData(){
    return (
        <div className="bg-dark text-white h-100 rounded">
            <div className="align-middle p-5">
                <h3><FileEarmarkExcelFill/></h3>
                <span>사진에 EXIF 정보가 없습니다.</span>
            </div>
        </div>
    )
}

export default NoExifData;