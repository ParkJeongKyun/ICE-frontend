self.importScripts('/js/ice_yara.js');

self.onmessage = async function (e) {
  const { binaryData, inputRule } = e.data;

  const allocateMemory = (size) => {
    const ptr = self.Module._malloc(size);
    return ptr;
  };

  const freeMemory = (ptr) => {
    self.Module._free(ptr);
  };

  const scanWithYaraAsync = (dataPtr, dataLength, rule) => {
    return new Promise((resolve) => {
      const scanWithYara = self.Module.cwrap('scan_with_yara', 'number', [
        'number',
        'number',
        'string',
      ]);
      scanWithYara(dataPtr, dataLength, rule);
      resolve();
    });
  };

  const getMatchedRuleNamesAsync = (countPtr) => {
    return new Promise((resolve) => {
      const getMatchedRuleNames = self.Module.cwrap(
        'get_matched_rule_names',
        'number',
        ['number']
      );
      const ruleNamesPtr = getMatchedRuleNames(countPtr);
      resolve(ruleNamesPtr);
    });
  };

  if (binaryData && inputRule) {
    const dataPtr = allocateMemory(binaryData.length);
    self.Module.HEAPU8.set(binaryData, dataPtr);

    await scanWithYaraAsync(dataPtr, binaryData.length, inputRule);

    const countPtr = allocateMemory(4);
    const ruleNamesPtr = await getMatchedRuleNamesAsync(countPtr);
    const count = self.Module.getValue(countPtr, 'i32');
    const matchedRuleNames = [];
    for (let i = 0; i < count; i++) {
      const ruleNamePtr = self.Module.getValue(ruleNamesPtr + i * 4, 'i32');
      const ruleName = self.Module.UTF8ToString(ruleNamePtr);
      matchedRuleNames.push(ruleName);
    }

    freeMemory(dataPtr);
    freeMemory(countPtr);

    self.postMessage(matchedRuleNames);
  }
};