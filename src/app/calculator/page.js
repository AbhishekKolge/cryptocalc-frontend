'use client';
import { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import _ from 'lodash';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ComboBoxPopover } from '@/components/ui/combo-box';

import {
  useLazyGetAllCoinsQuery,
  useLazyGetAllCurrenciesQuery,
  useCalculateExchangeMutation,
} from '@/features/crypto/cryptoApiSlice';

import { useFilter } from '@/hooks/filter';

import { DEBOUNCE_TIME } from '@/utils/defaults';

const exchangeValidationSchema = Yup.object({
  symbol: Yup.string().trim().required('Required'),
  requestFrom: Yup.string().trim().required('Required'),
  base: Yup.string().trim().required('Required'),
  amount: Yup.number(),
});

const Calculator = () => {
  const coinInputRef = useRef(null);
  const currencyInputRef = useRef(null);
  const [
    getAllCoins,
    { isLoading: coinIsLoading, isFetching: coinIsFetching },
  ] = useLazyGetAllCoinsQuery();
  const [
    getAllCurrencies,
    { isLoading: currencyIsLoading, isFetching: currencyIsFetching },
  ] = useLazyGetAllCurrenciesQuery();
  const [
    calculateExchange,
    { isLoading: exchangeIsLoading, isFetching: exchangeIsFetching },
  ] = useCalculateExchangeMutation();
  const {
    filterState: coinFilterState,
    state: coinState,
    dispatchState: dispatchCoinState,
    nextPageHandler: nextCoinPageHandler,
    searchHandler: searchCoinHandler,
    resetFilterHandler: resetCoinFilterHandler,
    selectHandler: coinSelectHandler,
  } = useFilter({ fetch: getAllCoins });
  const {
    filterState: currencyFilterState,
    state: currencyState,
    dispatchState: dispatchCurrencyState,
    nextPageHandler: nextCurrencyPageHandler,
    searchHandler: searchCurrencyHandler,
    resetFilterHandler: resetCurrencyFilterHandler,
    selectHandler: currencySelectHandler,
  } = useFilter({ fetch: getAllCurrencies });

  const exchangeFormik = useFormik({
    initialValues: {
      symbol: coinState.selected?.symbol || '',
      amount: null,
      requestFrom: '',
      base: currencyState.selected?.symbol || '',
    },
    enableReinitialize: true,
    validationSchema: exchangeValidationSchema,
    onSubmit: (values) => {
      if (!values.amount) {
        return toast.error('Please enter a valid amount');
      }
      calculateExchange(values)
        .unwrap()
        .then((data) => {
          if (data.symbol === data.requestFrom) {
            currencyInputRef.current.value = data.toAmount;
          } else {
            coinInputRef.current.value = data.toAmount;
          }
        })
        .catch((error) => {
          if (error.data?.msg) {
            toast.error(error.data.msg);
          } else {
            toast.error('Something went wrong!, please try again');
          }
        });
    },
  });

  const debouncedExchangeSubmit = useCallback(
    _.debounce(exchangeFormik.handleSubmit, DEBOUNCE_TIME),
    []
  );

  useEffect(() => {
    if (coinState.initialFetch) {
      getAllCoins({}, true)
        .unwrap()
        .then((data) => {
          dispatchCoinState({
            type: 'SET_DATA',
            data: data.result,
            totalPages: data.totalPages,
          });
        })
        .catch((error) => {
          if (error.data?.msg) {
            toast.error(error.data.msg);
          } else {
            toast.error('Something went wrong!, please try again');
          }
        });
    }
  }, [coinState, getAllCoins, dispatchCoinState]);

  useEffect(() => {
    if (currencyState.initialFetch) {
      getAllCurrencies({}, true)
        .unwrap()
        .then((data) => {
          dispatchCurrencyState({
            type: 'SET_DATA',
            data: data.result,
            totalPages: data.totalPages,
          });
        })
        .catch((error) => {
          if (error.data?.msg) {
            toast.error(error.data.msg);
          } else {
            toast.error('Something went wrong!, please try again');
          }
        });
    }
  }, [currencyState, getAllCurrencies, dispatchCurrencyState]);

  const coinAmountHandler = (e) => {
    const amount = e.target.value;
    exchangeFormik.setFieldValue('requestFrom', exchangeFormik.values.symbol);
    exchangeFormik.setFieldValue('amount', +amount);
    currencyInputRef.current.value = '';
    amount && debouncedExchangeSubmit();
  };

  const currencyAmountHandler = (e) => {
    const amount = e.target.value;
    exchangeFormik.setFieldValue('requestFrom', exchangeFormik.values.base);
    exchangeFormik.setFieldValue('amount', +amount);
    coinInputRef.current.value = '';
    amount && debouncedExchangeSubmit();
  };

  return (
    <section className='h-full grid justify-center items-center'>
      <Card className='w-[350px] md:w-[450px]'>
        <CardHeader>
          <CardTitle className='flex items-center justify-center'>
            Crypto Calculator
          </CardTitle>
        </CardHeader>
        <form noValidate onSubmit={exchangeFormik.handleSubmit}>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-col space-y-1.5'>
                <Label>Coin</Label>
                <div className='flex w-full items-center space-x-2'>
                  <Input
                    disabled={
                      !coinState.selected ||
                      !currencyState.selected ||
                      exchangeIsLoading
                    }
                    type='number'
                    placeholder='amount'
                    onChange={coinAmountHandler}
                    ref={coinInputRef}
                  />
                  <ComboBoxPopover
                    data={coinState.data}
                    isLoading={coinIsLoading || coinIsFetching}
                    onSearch={searchCoinHandler}
                    value={coinFilterState.search}
                    reset={resetCoinFilterHandler}
                    onLoadMore={nextCoinPageHandler}
                    onSelect={coinSelectHandler}
                    selected={coinState.selected}
                  />
                </div>
              </div>
              <div className='flex flex-col space-y-1.5'>
                <Label>Currency</Label>
                <div className='flex w-full items-center space-x-2'>
                  <Input
                    disabled={
                      !coinState.selected ||
                      !currencyState.selected ||
                      exchangeIsLoading
                    }
                    type='number'
                    placeholder='amount'
                    onChange={currencyAmountHandler}
                    ref={currencyInputRef}
                  />
                  <ComboBoxPopover
                    data={currencyState.data}
                    isLoading={currencyIsLoading || currencyIsFetching}
                    onSearch={searchCurrencyHandler}
                    value={currencyFilterState.search}
                    reset={resetCurrencyFilterHandler}
                    onLoadMore={nextCurrencyPageHandler}
                    onSelect={currencySelectHandler}
                    selected={currencyState.selected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              disabled={exchangeIsLoading || currencyIsLoading || coinIsLoading}
              type='submit'
              className='w-full'
            >
              {exchangeIsLoading && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Refresh
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};

export default Calculator;
