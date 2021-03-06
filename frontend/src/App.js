import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import './bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';

import HomeScreen from './screens/homeScreen/HomeScreen';
import DashboardScreen from './screens/dashboardScreen/DashboardScreen';
import TimesheetScreen from './screens/timesheetScreen/TimesheetScreen';
import ScheduleScreen from './screens/scheduleScreen/scheduleScreen';
import JobListScreen from './screens/jobListScreen/JobListScreen';
import JobDetailsScreen from './screens/jobDetailsScreen/JobDetailsScreen';
import Profile from './screens/profileScreen/ProfileScreen';
import CreateJobScreen from './screens/createJobScreen/CreateJobScreen';
import ClientListScreen from './screens/clientListScreen/ClientListScreen';
import CreateClientScreen from './screens/createClientScreen/CreateClientScreen';
import EditClientScreen from './screens/editClientScreen/EditClientScreen';
import JobPartScreen from './screens/jobPartScreen/JobPartScreen';
import CreateJobPartScreen from './screens/createJobPartScreen/CreateJobPartScreen';
import EditJobPartScreen from './screens/editJobPartScreen/EditJobPartScreen';
import EmployeesScreen from './screens/employeesScreen/EmployeesScreen';
import EditEmployeeScreen from './screens/editEmployeeScreen/EditEmployeeScreen';
import TimesheetUserReportScreen from './screens/timesheetUserReportScreen/TimesheetUserReportScreen';
import ContractorListScreen from './screens/contractorListScreen/ContractorListScreen';
import EditContractorScreen from './screens/editContractorScreen/EditContractorScreen';
import CreateContractorScreen from './screens/createContractorScreen/CreateContractorScreen';
import TimesheetJobReportScreen from './screens/timesheetJobReportScreen/TimesheetJobReportScreen';

const App = () => {
  const { isAuthenticated } = useAuth0();
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={isAuthenticated ? <DashboardScreen /> : <HomeScreen />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="timesheet" element={<TimesheetScreen />} />
          <Route path="clients" element={<ClientListScreen />} />
          <Route path="clients/edit/:id" element={<EditClientScreen />} />
          <Route path="clients/create" element={<CreateClientScreen />} />
          <Route path="contractors" element={<ContractorListScreen />} />
          <Route path="contractors/edit/:id" element={<EditContractorScreen />} />
          <Route path="contractors/create" element={<CreateContractorScreen />} />
          <Route path="jobs" element={<JobListScreen />} />
          <Route path="job/details/:id" element={<JobDetailsScreen />} />
          <Route path="jobs/create" element={<CreateJobScreen />} />
          <Route path="jobparts" element={<JobPartScreen />} />
          <Route path="jobparts/edit/:id" element={<EditJobPartScreen />} />
          <Route path="jobparts/create" element={<CreateJobPartScreen />} />
          <Route path="employees" element={<EmployeesScreen />} />
          <Route path="employees/edit/:id" element={<EditEmployeeScreen />} />
          <Route path="schedule" element={<ScheduleScreen />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports/timesheets/employees" element={<TimesheetUserReportScreen />} />
          <Route path="reports/timesheets/jobs" element={<TimesheetJobReportScreen />} />
        </Routes>
      </Layout>
    </Router>
  );
};
export default App;
