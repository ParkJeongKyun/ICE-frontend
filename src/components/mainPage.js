import React, { useState, useCallback, useEffect } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

import SumComponent from "./sumComponent";
import HexComponent from "./hexComponent";

function TerminalController(props) {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>
      신규 개발중입니다! 업그레이드 후 찾아뵙겠습니다!<br/>
      현재 사용 가능한 명령어<br/>
      hex [-l] [hex]<br/>
      안녕<br/>
      writeprotect<br/>      
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
    } else if (main_command == "sum") {
      setTerminalLineData(<SumComponent num1={option} num2={input}/>);
    } else if (main_command == "hex") {
      let littleEndian = false;
      if (option != null) {
        if (option == "-l") {
          littleEndian = true;
        } else {
          setTerminalLineData(<TerminalOutput>{option}는 사용할수 없는 옵션입니다!</TerminalOutput>);
          return;
        }
      }
      setTerminalLineData(<HexComponent hex={input} littleEndian={littleEndian}/>);
    } else if (main_command == "writeprotect") {
      setTerminalLineData(<TerminalOutput>reg add "HKLM\System\CurrentControlSet\Control\StorageDevicePolicies" /t Reg_dword /v WriteProtect /f /d 1</TerminalOutput>);
    } else {
      setTerminalLineData(<TerminalOutput>명령어를 이해하지 못했어요!</TerminalOutput>);
    }
  }, []);

  return (
    <div className="container">
      <Terminal name='ICE 터미널' prompt="ICE-User$" colorMode={ ColorMode }  onInput={ terminalInput => helper(terminalInput)}>
        { terminalLineData }
      </Terminal>
    </div>
  );
}

// 메인 웹 페이지
function MainPage() {
  return (
    <TerminalController/>
  );
}
  
export default MainPage;