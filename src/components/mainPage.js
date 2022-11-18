import React, { useState, useCallback, useEffect } from 'react';

import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

import { useWasm } from "react-wasm";
import mainWasmPath  from "../main.wasm";

function SumComponent(props) {
  const {
    loading,
    error,
    data 
  } = useWasm({
    url: mainWasmPath
  });
  
  if (loading) return "연산중...";
  if (error) return "에러!";
  
  const { module, instance } = data;
  return <div>{props.num} + {props.num} = {instance.exports.Sum(props.num, props.num)}</div>;
};

function TerminalController(props) {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>신규 개발중입니다! 업그레이드 후 찾아뵙겠습니다!</TerminalOutput>,
  ]);

  const helper = useCallback( terminalInput => {
    const command = terminalInput.split(" ")[0]

    if(command == "안녕"){
      setTerminalLineData(<TerminalOutput>안녕하세요!</TerminalOutput>);
    } else if (command == "sum") {
      const command2 = parseInt(terminalInput.split(" ")[1])
      setTerminalLineData(<SumComponent num={command2}/>);
    } else {
      setTerminalLineData(<TerminalOutput>알 수 없는 명령어에요!</TerminalOutput>);
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