import { useReducer, useCallback } from 'react';
import toast from 'react-hot-toast';
import _ from 'lodash';

import { DEBOUNCE_TIME } from '@/utils/defaults';

const initialFilterState = {
  search: null,
  pageNumber: 1,
};

const initialState = {
  totalPages: 0,
  data: [],
  initialFetch: true,
  selected: null,
};

const filterReducer = (state, action) => {
  if (action.type === 'CHANGE_PAGE') {
    return {
      ...state,
      pageNumber: action.pageNumber,
    };
  }
  if (action.type === 'SEARCH') {
    return {
      ...state,
      pageNumber: initialFilterState.pageNumber,
      search: action.search,
    };
  }
  if (action.type === 'RESET_FILTERS') {
    return {
      ...initialFilterState,
    };
  }
  return initialFilterState;
};

const stateReducer = (state, action) => {
  if (action.type === 'SET_DATA') {
    return {
      ...state,
      totalPages: action.totalPages,
      data: action.data,
      initialFetch: false,
      selected: state.selected ? state.selected : action.data[0],
    };
  }
  if (action.type === 'APPEND_DATA') {
    return {
      ...state,
      data: [...state.data, ...action.data],
    };
  }
  if (action.type === 'CLEAR_DATA') {
    return {
      ...initialState,
      selected: state.selected,
    };
  }
  if (action.type === 'SET_SELECTED') {
    return {
      ...initialState,
      selected: action.selected,
    };
  }
  return initialState;
};

const useFilter = ({ fetch }) => {
  const [filterState, dispatchFilter] = useReducer(
    filterReducer,
    initialFilterState
  );
  const [state, dispatchState] = useReducer(stateReducer, initialState);

  const nextPageHandler = () => {
    if (filterState.pageNumber < state.totalPages) {
      dispatchFilter({
        type: 'CHANGE_PAGE',
        pageNumber: filterState.pageNumber + 1,
      });
      fetch({ ...filterState, pageNumber: filterState.pageNumber + 1 }, true)
        .unwrap()
        .then((data) => {
          dispatchState({
            type: 'APPEND_DATA',
            data: data.result,
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
  };

  const debouncedHandleSearch = useCallback(
    _.debounce((search) => {
      fetch({ ...initialFilterState, search }, true)
        .unwrap()
        .then((data) => {
          dispatchState({
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
    }, DEBOUNCE_TIME),
    []
  );
  const searchHandler = (value) => {
    const search = value;
    dispatchFilter({ type: 'SEARCH', search });
    debouncedHandleSearch(search);
  };

  const resetFilterHandler = () => {
    dispatchFilter({ type: 'RESET_FILTERS' });
    dispatchState({
      type: 'CLEAR_DATA',
    });
  };

  const selectHandler = (value) => {
    dispatchState({
      type: 'SET_SELECTED',
      selected: value,
    });
    dispatchFilter({ type: 'RESET_FILTERS' });
  };

  return {
    filterState,
    state,
    dispatchState,
    nextPageHandler,
    searchHandler,
    resetFilterHandler,
    selectHandler,
  };
};

export { useFilter };
