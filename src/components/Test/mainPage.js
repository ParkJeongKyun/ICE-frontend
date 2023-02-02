import React, { useState, useCallback, useEffect } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

// Component
import HexComponent from "./hexComponent";

// 터미널 테스트
function TerminalController(props) {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>
      <h5 className="text-info">신규 개발중입니다! 업그레이드 후 찾아뵙겠습니다!</h5>
      [ 현재 사용 가능한 명령어 ]<br/>
      hex [-l] [HEX_Value], 헥스 [-리틀] [16진수값], 안녕, writeprotect, 쓰기방지, sum [숫자1] [숫자2]
    </TerminalOutput>,
  ]);

  const helper = useCallback( terminalInput => {

    const splitedCommand = terminalInput.match(/(?:[^\s']+|'[^']*')+/g);

    if (splitedCommand.length < 1){
      setTerminalLineData(<TerminalOutput>명령어를 입력하세요!</TerminalOutput>);
      return;
    }
    if (splitedCommand.length > 3){
      setTerminalLineData(<TerminalOutput>입력값이 너무 많아요!</TerminalOutput>);
      return;
    }

    const main_command = splitedCommand[0];
    let option = null;
    let input = null;

    if (splitedCommand.length > 2) {
      option = splitedCommand[1];
      input = splitedCommand[2];
    } else {
      input = splitedCommand[1];
    }
    
    if (main_command == "안녕"){
      setTerminalLineData(<TerminalOutput>안녕하세요!</TerminalOutput>);
    } else if (main_command == "hex" || main_command == "헥스") {
      let littleEndian = false;
      if (option != null) {
        if (option == "-l" || option == "-리틀") {
          littleEndian = true;
        } else {
          setTerminalLineData(<TerminalOutput>{option}는 사용할수 없는 옵션입니다!</TerminalOutput>);
          return;
        }
      }
      setTerminalLineData(<HexComponent hex={input} littleEndian={littleEndian}/>);
    } else if (main_command == "writeprotect" || main_command == "쓰기방지") {
      setTerminalLineData(
        <TerminalOutput>
          <span>관리자 권한 명령 프롬프트에서 아래 명령어를 입력하세요!</span><br/>
          <span className="text-danger">reg add </span>
          <span className="text-primary">"HKLM\System\CurrentControlSet\Control\StorageDevicePolicies" </span>
          <span className="text-success">/t Reg_dword </span>
          <span className="text-warning">/v WriteProtect </span>
          <span className="text-info">/d 1 </span>
          <span className="text-secondary">/f </span>
        </TerminalOutput>);
    } else {
      setTerminalLineData(<TerminalOutput>명령어를 이해하지 못했어요!</TerminalOutput>);
    }
  }, []);

  return (
      <Terminal name='ICE 터미널' prompt="ICE-User$" colorMode={ColorMode}  onInput={terminalInput => helper(terminalInput)}>
        {terminalLineData}
      </Terminal>
  );
}

// 메인 웹 페이지
function MainPage() {
  return (
    <TerminalController/>
  );
}
  
export default MainPage;