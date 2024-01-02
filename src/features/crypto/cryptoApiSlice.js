import apiSlice from '../../state/api/apiSlice';
import { omitNullishKeys } from '../../utils/helper';

const cryptoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCoins: builder.query({
      query: (queries) => ({
        url: '/crypto/list/coins',
        params: omitNullishKeys(queries),
      }),
      providesTags: ['Coins'],
    }),
    getAllCurrencies: builder.query({
      query: (queries) => ({
        url: '/crypto/list/currencies',
        params: omitNullishKeys(queries),
      }),
      providesTags: ['Currencies'],
    }),
    calculateExchange: builder.mutation({
      query: (queries) => ({
        url: '/crypto/exchange',
        method: 'POST',
        body: omitNullishKeys(queries),
      }),
    }),
  }),
});

export const {
  useLazyGetAllCoinsQuery,
  useLazyGetAllCurrenciesQuery,
  useCalculateExchangeMutation,
} = cryptoApiSlice;
