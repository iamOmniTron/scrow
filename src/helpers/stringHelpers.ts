export const dateToMilliSeconds = (date: string): number => {
  try {
    let parsedDate = Date.parse(date);
    return parsedDate;
  } catch (error) {
    throw new Error("Incorrect date format");
  }
};

export const millisecondsToDate = (milliseconds: number): string => {
  try {
    let date = new Date(milliseconds);
    return date.toString();
  } catch (error) {
    throw new Error(error.message);
  }
};
