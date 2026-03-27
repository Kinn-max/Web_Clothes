export function searchByKeyword<T>(
  data: T[],
  keyword: string,
  fields: (keyof T)[]
): T[] {
  if (!keyword.trim()) return data;

  const lowerKeyword = keyword.toLowerCase();

  return data.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return value?.toString().toLowerCase().includes(lowerKeyword);
    })
  );
}
