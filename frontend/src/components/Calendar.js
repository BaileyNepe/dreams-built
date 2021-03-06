import { useState, useEffect } from 'react';
import fontColorContrast from 'font-color-contrast';

import ScheduleEditDueDate from './modals/ScheduleEditDueDate';
import ScheduleCreateDueDate from './modals/ScheduleCreateDueDate';

import styles from './calendar.module.css';

const Calendar = ({ jobPart, week, dueDates, loading, dueDateLoading, filterContractor }) => {
  const [actionItem, setActionItem] = useState('');
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalCreateShow, setModalCreateShow] = useState(false);
  const [date, setDate] = useState('');
  const [job, setJob] = useState('');

  const filterContractorIds = filterContractor.map((contractor) => contractor._id);

  useEffect(() => {
    if (!loading && !dueDateLoading && dueDates) {
      const search = dueDates.filter((dueDate) => dueDate.jobPartTitle._id === jobPart._id);
      setActionItem(search);
    }
  }, [dueDates, jobPart, loading, dueDateLoading]);

  const editJobHandler = (e, job) => {
    e.stopPropagation();
    setJob(job);
    setModalEditShow(true);
  };

  const createJobHandler = (date) => {
    setDate(date);
    setModalCreateShow(true);
  };

  return (
    !loading &&
    !dueDateLoading && (
      <>
        <tr>
          <th className={styles.heading}>{jobPart.jobPartTitle}</th>
          {week.map(({ isoDate, date }) => (
            <td key={isoDate} className={styles.item} onClick={() => createJobHandler(date)}>
              {actionItem &&
                actionItem
                  .filter((dueDate) => dueDate.dueDateRange.includes(isoDate))
                  .filter((job) => {
                    if (filterContractor.length > 0) {
                      return job.contractors.map((contractor) => contractor._id).some((contractor) => filterContractorIds.includes(contractor));
                    } else {
                      return job;
                    }
                  })
                  .map((job) => (
                    <div
                      key={job.job._id}
                      style={{ borderRadius: '0.2rem' }}
                      className={styles['job-container']}
                      onClick={(e) => {
                        editJobHandler(e, job);
                      }}
                    >
                      <div style={{ backgroundColor: job.job.color, color: fontColorContrast(job.job.color) }} className={styles['job-insert']}>
                        {job.job.jobNumber} - <span className={styles.mobile}>{job.job.address.slice(0, 5)}...</span>
                        <span className={styles.desktop}>
                          {job.job.address} <br /> <em>{job.details}</em>
                        </span>
                      </div>
                    </div>
                  ))}
              <div className={styles.blank}></div>
            </td>
          ))}
        </tr>
        <ScheduleEditDueDate show={modalEditShow} job={job} jobPart={jobPart} setModalShow={setModalEditShow} onHide={() => setModalEditShow(false)} />
        <ScheduleCreateDueDate show={modalCreateShow} date={date} jobPart={jobPart} setModalShow={setModalCreateShow} onHide={() => setModalCreateShow(false)} />
      </>
    )
  );
};

export default Calendar;
