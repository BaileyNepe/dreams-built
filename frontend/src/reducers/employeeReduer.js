import * as actions from '../constants/employeeConstants';

export const getEmployeesReducer = (state = { employeeList: [] }, action) => {
  switch (action.type) {
    case actions.EMPLOYEELIST_FETCH_REQUEST:
      return { loading: true };
    case actions.EMPLOYEELIST_FETCH_SUCCESS:
      return { loading: false, employeeList: action.payload };
    case actions.EMPLOYEELIST_FETCH_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userReducer = (state = { user: [] }, action) => {
  switch (action.type) {
    case actions.USER_RESET_REDIRECT:
      return { redirect: false, user: [] };
    case actions.USER_CREATE_REQUEST:
      return { loading: true, redirect: false };
    case actions.USER_CREATE_SUCCESS:
      return { loading: false, redirect: true, user: action.payload };
    case actions.USER_CREATE_FAIL:
      return { loading: false, error: action.payload, redirect: false };
    case actions.USER_FETCH_REQUEST:
      return { loading: true };
    case actions.USER_FETCH_SUCCESS:
      return { loading: false, user: action.payload };
    case actions.USER_FETCH_FAIL:
      return { loading: false, error: action.payload };
    case actions.USER_UPDATE_REQUEST:
      return { loading: true };
    case actions.USER_UPDATE_SUCCESS:
      return { loading: false, redirect: true, user: action.payload };
    case actions.USER_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case actions.USER_DELETE_REQUEST:
      return { loading: true };
    case actions.USER_DELETE_SUCCESS:
      return { loading: false, redirect: true, user: action.payload };
    case actions.USER_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};