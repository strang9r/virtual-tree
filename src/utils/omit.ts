export const omit = <T, K extends keyof T>(obj: T, strs: K[]) => {
  strs.forEach((s) => {
    if (Object.hasOwnProperty.call(obj, s)) {
      delete obj[s];
    }
  });
  return obj as Omit<T, K>;
};
