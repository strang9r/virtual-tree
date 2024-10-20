export const cloneArray = <T>(arr: T[]) => {
  const newArray = [];

  for (const item of arr) {
    newArray.push(item);
  }

  return newArray;
};
