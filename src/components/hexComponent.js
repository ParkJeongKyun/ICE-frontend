import React, { useState, useEffect } from 'react';

function HexComponent(props) {
    const [hex, setHex] = useState(0);
    const [toDecimal, setToDecimal] = useState(0);
    const [toBinary, setToBinary] = useState(0);
    const [toAscii, setToAscii] = useState(0);
  
    useEffect(() => {
    if (typeof(props.hex) == "string"){
      let hex_list = props.hex.match(/.{1,2}/g);
  
      if(props.littleEndian){
        hex_list.reverse();
      }
  
      let hex_value = hex_list.toString().replaceAll(",", "");
      let hex_to_decimal = parseInt(hex_value, 16);
      let hex_to_binary = (parseInt(hex_value, 16).toString(2)).padStart(8, '0');
      let hex_to_ascii = "";
      for (const idx in hex_list) {hex_to_ascii += String.fromCharCode(parseInt(hex_list[idx], 16));}
  
      setHex(hex_value);
      setToDecimal(hex_to_decimal.toLocaleString('ko-KR'));
      setToBinary(hex_to_binary.match(/.{1,4}/g).join("-"));
      setToAscii(hex_to_ascii);
    }
    }, [props.hex]);
  
    return (
      <div>
        <p>
          16진수 = {hex}<br/>
          10진수 = {toDecimal}<br/>
          2진수 = {toBinary}<br/>
          아스키 = {toAscii}<br/>
        </p>
      </div>
    )
  }

export default HexComponent;