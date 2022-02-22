import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { entryArrayReducer, validateReducer } from './reducers/timesheetReducer';
import { jobDueDatesReducer, getJobPartsReducer, getJobsReducer, jobPartReducer, jobReducer, getDueDatesReducer } from './reducers/jobReducer';
import { clientReducer, getClientsReducer } from './reducers/clientReducer';
import { getEmployeesReducer, profileReducer, userReducer } from './reducers/employeeReduer';
import { reportReducer } from './reducers/reportsReducer';
import { contractorReducer, getContractorsReducer } from './reducers/contractorReducer';

const reducer = combineReducers({
  timesheet: entryArrayReducer,
  validatedTimesheet: validateReducer,
  jobsList: getJobsReducer,
  job: jobReducer,
  jobParts: getJobPartsReducer,
  jobPart: jobPartReducer,
  clients: getClientsReducer,
  client: clientReducer,
  contractors: getContractorsReducer,
  contractor: contractorReducer,
  employees: getEmployeesReducer,
  employee: userReducer,
  profile: profileReducer,
  jobDueDates: jobDueDatesReducer,
  dueDateList: getDueDatesReducer,
  reports: reportReducer,
});

const middleware = [thunk];

const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
