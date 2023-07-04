import dayjs from "dayjs";

export const DATE_FORMAT = "YYYY년 MM월 DD일 HH시 mm분 ss초";

export const getDate = (dateStr: string | number): string => {
  const formattedDate = dayjs(dateStr);
  if (formattedDate.isValid()) {
    return formattedDate.format(DATE_FORMAT);
  } else {
    return "";
  }
};
