type PaginationInfo = {
  total_items: number;
  is_last_page: boolean;
  last_page: number;
  next_page: number | null;
  prev_page: number | null;
  is_valid_page: boolean;
  total_pages: number;
  page: number;
  limit: number;
};

export function getPaginationInfo<T>(
  total_items: number,
  data: T[],
  page: number,
  limit: number,
): PaginationInfo {
  const total_pages = Math.ceil(total_items / limit);
  const is_last_page = page >= total_pages;
  const last_page = total_pages;
  const next_page = is_last_page ? null : page + 1;
  const prev_page = page <= 1 ? null : page - 1;
  const is_valid_page = page > 0 && page <= total_pages;

  return {
    total_pages,
    is_last_page,
    last_page,
    next_page,
    prev_page,
    is_valid_page,
    total_items,
    page,
    limit,
  };
}
