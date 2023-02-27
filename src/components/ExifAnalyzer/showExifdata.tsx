interface Props {
    value: string;
    name: string;
    unit?: string;
}

// 세부 정보
function ShowInfo(props: Props) {
    return (
        <div className="d-flex mt-4 align-items-center justify-content-between">
            <div>
                <h6 className="mb-0" style={{fontWeight:"400"}}>
                { props.value ?
                    props.value : "-"        
                }
                </h6>
                <p className="m-0" style={{fontSize:"0.75em"}}>{props.name}</p>
            </div>
            <div>
                <h6 className="mb-0" style={{fontWeight:"400"}}>
                    {props.unit}
                </h6>  
            </div>         
        </div>
    );
}

export default ShowInfo;