type NumericString = `${number}`;
type OrderDir = 'asc' | 'desc';
type SearchType = 'contains' | 'ends' | 'starts';
type FilterOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'in' | 'nin';
type FieldArray<T extends object = any> = (keyof T)[];

export type IncomingQueryParams = {
  page?: NumericString;
  limit?: NumericString;
  order_by?: string;
  order_dir?: OrderDir;
  search_value?: string;
  search_fields?: string;
  search_type?: SearchType;
  filter_value?: string;
  filter_fields?: string;
  filter_operator?: FilterOperator;

  [key: string]: any;
};

export type QueryParams<T extends object = any> = {
  pagination?: {
    page: number; // 1
    limit: number; // 20
  };
  order: {
    by: string; // created_at
    dir: OrderDir; // "desc"
  };
  search?: {
    value: string;
    fields: FieldArray<T>;
    type: 'contains' | 'ends' | 'starts'; // contians
  };
  filter?: {
    value: string | number | boolean;
    fields: FieldArray<T>;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'in' | 'nin'; // eq
  };
  [key: string]: any;
};

export function queryParser<T extends object>(
  query?: IncomingQueryParams,
): QueryParams<T> {
  if (!query) return {} as QueryParams<T>;

  const result: Partial<QueryParams<T>> = {};

  if (query.page !== undefined) {
    const page = isNaN(Number(query.page)) ? 1 : Number(query.page);
    const limit = isNaN(Number(query.limit)) ? 20 : Number(query.limit);

    result.pagination = {
      page,
      limit,
    };
  }

  if (query.search_value !== undefined) {
    const value = String(query.search_value).trim();
    const fields = String(query.search_fields).split(',') as FieldArray<T>;
    const type: SearchType = query.search_type ?? 'contains';

    result.search = {
      value,
      fields,
      type,
    };
  }

  if (query.filter_value !== undefined) {
    const value = String(query.filter_value).trim();
    const fields = String(query.filter_fields).split(',') as FieldArray<T>;
    const operator: FilterOperator = query.filter_operator ?? 'eq';

    result.filter = {
      value,
      fields,
      operator,
    };
  }

  result.order = {
    by: query.order_by ?? 'created_at',
    dir: query.order_dir ?? 'desc',
  };

  return result as QueryParams<T>;
}

type PrismaQueries = {
  orderBy: {
    [field: string]: OrderDir;
  };
  where?: {
    [field: string]: {
      [key in SearchType]?: string;
    };
  };
  take?: number;
  skip?: number;
};

export function queryHandler<T extends object>(query: QueryParams<T>) {
  const result: Partial<PrismaQueries> = {};

  result.orderBy = {
    [query.order.by]: query.order.dir,
  };

  if (query.pagination) {
    const take = query.pagination.limit;
    const skip = query.pagination.page * take - take;

    result.skip = skip;
    result.take = take;
  }

  if (query.search) {
    for (const field of query.search.fields) {
      if (!result.where) {
        result.where = {};
      }

      result.where = {
        ...result.where,
        [field]: {
          [query.search.type]: query.search.value,
        },
      };
    }
  }

  if (query.filter) {
    for (const field of query.filter.fields) {
      if (!result.where) {
        result.where = {};
      }

      if (result.where[field as keyof typeof result.where]) {
        result.where[field as keyof typeof result.where] = {
          [query.filter.operator]: query.filter.value,
        };
      } else {
        result.where = {
          ...result.where,
          [field]: {
            [query.filter.operator]: query.filter.value,
          },
        };
      }
    }
  }

  const { where = {}, orderBy, skip, take } = result;
  const pagination =
    query.pagination?.page === undefined
      ? undefined
      : { page: query.pagination.page, limit: take, skip };

  return {
    where,
    orderBy,
    pagination,
  } as {
    where: Required<PrismaQueries['where']>;
    orderBy: PrismaQueries['orderBy'];
    pagination?:
      | {
          page: number;
          limit: number;
          skip: number;
        }
      | undefined;
  };
}
