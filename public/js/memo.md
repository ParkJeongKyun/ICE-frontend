python3 -m http.server 8000

emcc -o test.html test.c -s WASM=1 -I/home/kyun/KYUN/yara-4.1.3/libyara/include -L/home/kyun/KYUN/yara-4.1.3/libyara/.libs -lyara -s USE_PTHREADS=0

emcc -o test.js test.c -s WASM=1 -I/home/kyun/KYUN/yara-4.1.3/libyara/include -L/home/kyun/KYUN/yara-4.1.3/libyara/.libs -lyara -s USE_PTHREADS=0 EXPORTED_FUNCTIONS="['_malloc', '_free', '_scan_with_yara']" -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$stringToUTF8'

emcc -o test.js test.c -s WASM=1 -I/home/kyun/KYUN/yara-4.1.3/libyara/include -L/home/kyun/KYUN/yara-4.1.3/libyara/.libs -lyara -s USE_PTHREADS=0 -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_scan_with_yar
a']" -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$stringToUTF8'

```js
const binaryData = new Uint8Array([0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65]);
const ruleStr = 'rule example { strings: $a = "example" condition: $a }';

// Allocate memory for binary data and rule string
const binaryDataPtr = Module._malloc(
  binaryData.length * binaryData.BYTES_PER_ELEMENT
);
Module.HEAPU8.set(binaryData, binaryDataPtr);

const lengthBytes = lengthBytesUTF8(ruleStr) + 1; // +1 for null terminator
const ruleStrPointer = Module._malloc(lengthBytes);
stringToUTF8(ruleStr, ruleStrPointer, lengthBytes);

Module._scan_with_yara(binaryData, binaryData.length, ruleStrPointer);

// Free allocated memory
Module._free(binaryDataPtr);
Module._free(ruleStrPointer);
```
