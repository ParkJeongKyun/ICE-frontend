interface Props {
    main_text: React.ReactNode;
    sub_text: string;
    side_text?: string;
    link?: string;
}

// 세부 정보
function ShowInfo(props:Props) {
  return (
      <div className="d-flex mt-4 align-items-center justify-content-between">
          <div>
              <h6 className="mb-0" style={{fontSize:"0.75em", fontWeight:"600"}}>{props.main_text}</h6>
              <p className="m-0" style={{fontSize:"0.75em"}}>{props.sub_text}</p>
          </div>
          <div>
              <h6 className="mb-0" style={{fontSize:"0.75em", fontWeight:"400"}}>
                  {props.side_text}
              </h6>  
          </div>         
      </div>
  );
}

// 세부 정보
function ShowInfoLink(props:Props) {
  return (
    <div className="d-flex mt-4 align-items-center justify-content-between">
        <div>
            <a className="text-black" target="_blank" rel="noopener noreferrer" href={props.link}>
            <h6 className="mb-0" style={{fontSize:"0.75em", fontWeight:"600"}}>{props.main_text}</h6>
            </a>
            <p className="m-0" style={{fontSize:"0.75em"}}>{props.sub_text}</p>
        </div>
        <div>
            <h6 className="mb-0" style={{fontWeight:"400"}}>
                {props.side_text}
            </h6>  
        </div>         
    </div>
  );
}


export {
    ShowInfo, ShowInfoLink
};