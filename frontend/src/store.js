import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { timeSheetReducer } from "./reducers/timeSheetReducer";

const reducer = combineReducers({
  timeSheetData: timeSheetReducer,
});

const timeSheetDataFromStorage = localStorage.getItem("timeSheetData") ? JSON.parse(localStorage.getItem("timeSheetData")) : [];

const initialState = {
  timeSheetData: timeSheetDataFromStorage,
};

const middleware = [thunk];

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
