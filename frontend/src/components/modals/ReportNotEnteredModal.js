import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const ReportNotEnteredModal = ({ setModalShow, ...rest }) => {
  const timesheetList = useSelector((state) => state.reports);
  const { usersNotEntered } = timesheetList;
  return (
    <Modal {...rest} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h1 style={{ fontSize: '1.7rem' }}>Users</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ textAlign: 'center' }}>
        {usersNotEntered && usersNotEntered.length > 0 ? (
          <ul>
            {usersNotEntered.map((user) => (
              <li key={user._id}>
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        ) : (
          <p>Everyone has entered!</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReportNotEnteredModal;
