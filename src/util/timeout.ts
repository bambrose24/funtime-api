export async function timeout<T>(
  fn: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const result = Promise.race([
    fn,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
  return result as T;
}
