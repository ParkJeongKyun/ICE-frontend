
import React, { useState, useCallback, useEffect } from 'react';

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
  return <div>{props.num1} + {props.num2} = {instance.exports.Sum(parseInt(props.num1), parseInt(props.num2))}</div>;
}


export default SumComponent;