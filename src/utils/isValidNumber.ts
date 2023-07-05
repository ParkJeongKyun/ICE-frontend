// 숫자 유효성 검사
export function isValidNumber(value: unknown): boolean {
  if (typeof value === "number") {
    return isFinite(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numberValue = Number(value);
    return !isNaN(numberValue) && isFinite(numberValue);
  }

  return false;
}
