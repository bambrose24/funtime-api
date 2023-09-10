/**
 * Given a sorted list, and a getter, will return a list with rankings holding ties as the same number until the next person
 */
export function withRankingField<T extends object>(
  data: T[],
  countGetter: (d: T) => number
): Array<T & {ranking: number}> {
  let ranking = 1;
  let prevVal: number | undefined;
  return data.map((d, i) => {
    const val = countGetter(d);
    if (prevVal !== val) {
      prevVal = val;
      ranking = i + 1;
    }
    return {...d, ranking};
  });
}
