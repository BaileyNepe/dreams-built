import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-date-picker';
import { BsFillPrinterFill, BsFillCalendarFill, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import ReactToPrint from 'react-to-print';

import { getEmployeeTimeSheets, getEmployeeTimeSheetsNotEntered, resetReportRefresh } from '../../actions/reportActions';
import { getJobList } from '../../actions/jobActions';

import EmployeeReportCard from '../../components/EmployeeReportCard';
import Message from '../../components/Message';
import ReportNoteEnteredModal from '../../components/modals/ReportNotEnteredModal';
import Loader from '../../components/Loader';

import styles from './timesheetReports.module.css';

const TimesheetUserReportScreen = () => {
  const { getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const componentRef = useRef();

  const timesheetList = useSelector((state) => state.reports);
  const { error, timesheets, refresh } = timesheetList;

  const dbDateFormat = 'dd/MM/yyyy';
  const startWeekInit = DateTime.now().startOf('week');

  const [modalShow, setModalShow] = useState(false);
  const [weekStart, setWeekStart] = useState({ calendar: startWeekInit.toJSDate(), db: startWeekInit.toFormat(dbDateFormat) });

  useEffect(() => {
    if (refresh) {
      dispatch(resetReportRefresh());
    } else {
      (async () => {
        try {
          const token = await getAccessTokenSilently();
          dispatch(getEmployeeTimeSheets(token, weekStart.db));
          dispatch(getJobList(token));
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [dispatch, getAccessTokenSilently, weekStart.db, refresh]);

  const changeDateHandler = (e) => {
    const date = DateTime.fromJSDate(e).startOf('week');
    setWeekStart({ calendar: date.toJSDate(), db: date.toFormat(dbDateFormat) });
  };

  const changeDateWeekHandler = (e) => {
    const date = DateTime.fromJSDate(weekStart.calendar);
    if (e === 1) {
      const advancedDate = date.plus({ days: 7 }).startOf('week');
      setWeekStart({ calendar: advancedDate.toJSDate(), db: advancedDate.toFormat(dbDateFormat) });
    } else {
      const retreatedDate = date.minus({ days: 7 }).startOf('week');
      setWeekStart({ calendar: retreatedDate.toJSDate(), db: retreatedDate.toFormat(dbDateFormat) });
    }
  };

  const getNotEnteredUsers = async () => {
    const token = await getAccessTokenSilently();
    dispatch(getEmployeeTimeSheetsNotEntered(token, weekStart.db));
    setModalShow(true);
  };

  return error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <section className="container">
      <div className={styles.page}>
        <h1 style={{ textAlign: 'center' }}>Timesheets</h1>
        <div className={styles.controls}>
          <div>
            <Button onClick={getNotEnteredUsers}>Not Entered</Button>
          </div>

          <div className={styles.pagination}>
            <Button
              className={styles['btn-pag']}
              onClick={() => {
                changeDateWeekHandler(0);
              }}
            >
              <BsArrowLeft />
            </Button>
            <DatePicker calendarIcon={<BsFillCalendarFill />} onChange={changeDateHandler} clearIcon={null} value={weekStart.calendar} />

            <Button
              className={styles['btn-pag']}
              onClick={() => {
                changeDateWeekHandler(1);
              }}
            >
              <BsArrowRight />
            </Button>
          </div>
          <div className={styles['printer-container']}>
            <ReactToPrint
              trigger={() => (
                <button className={styles.printer}>
                  <BsFillPrinterFill />
                </button>
              )}
              content={() => componentRef.current}
            />
          </div>
        </div>
        <div ref={componentRef}>
          {timesheets.sortedByEmployee &&
            timesheets.sortedByEmployee.map((employee) => (
              <div key={employee._id}>
                <div className="page-break" />
                <div className={styles.card}>
                  <EmployeeReportCard employee={employee} />
                </div>
              </div>
            ))}
        </div>
      </div>
      <ReportNoteEnteredModal show={modalShow} setModalShow={setModalShow} onHide={() => setModalShow(false)} />
    </section>
  );
};

export default withAuthenticationRequired(TimesheetUserReportScreen, {
  onRedirecting: () => <Loader />,
});
