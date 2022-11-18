import React, { useState, useCallback, useEffect } from 'react';

import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

import { useWasm } from "react-wasm";
import path1  from "../main.wasm";

// supposing an "add.wasm" module that exports a single function "add"
const ExampleComponent = () => {
  const {
    loading,
    error,
    data 
  } = useWasm({
    url: path1
  });
  
  if (loading) return "Loading...";
  if (error) return "ERROR";
  
  const { module, instance } = data;
  return <div>1 + 2 = {instance.exports.Sum(1, 2)}</div>;
};

function TerminalController(props) {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>현재 Python 백엔드 API가 폐쇄 되었습니다. 업그레이드 후 찾아뵙겠습니다!</TerminalOutput>,
  ]);

  const helper = useCallback( terminalInput => {
    if(terminalInput == "안녕"){
      setTerminalLineData(<TerminalOutput>안녕하세요!<ExampleComponent></ExampleComponent></TerminalOutput>);
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