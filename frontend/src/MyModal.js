import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
// Make sure you have this line in your App.js or index.js
import 'bootstrap/dist/css/bootstrap.min.css';

import UserList from './components/UserList';
import CreateGroup from './components/CreateGroup';

function MyModal({ msg }) {
    // 1. Manage the modal's visibility with state
    const [show, setShow] = useState(false);

    // 2. Create handler functions to show and hide the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            {/* 3. The button uses an onClick handler to open the modal */}
            <Button variant="primary" className='m-2 rounded-pill' onClick={handleShow}>
                {msg}
            </Button>

            {/* 4. The Modal component's visibility is controlled by the `show` state */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Users</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { (msg === "+") ? <UserList /> : <CreateGroup onClose={()=>setShow(false)}/> }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MyModal;