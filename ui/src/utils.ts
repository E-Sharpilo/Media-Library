export const getPageFromSearch = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get("page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const getTagsFromSearch = (searchParams: URLSearchParams) =>
  (searchParams.get("tags") || "")
    .split(",")
    .map(Number)
    .filter((tagId) => Number.isInteger(tagId) && tagId > 0);
