export const wait = (waitTime: number): Promise<void> => new Promise(
  (resolve): NodeJS.Timeout => setTimeout(
    () => resolve(), waitTime,
  ),
);
