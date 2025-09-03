
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createGroup } from '../api';
import { Link, useNavigate } from "react-router-dom";

const CreateGroup = () => {

    const [message, setMessage] = useState("");
    const [name, setName] = useState('')
    const [room_type, setRoomType] = useState('')
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { name, room_type }
        //console.log(formData)
        try {
            const res = await createGroup(formData);
            if (res && !res.errors) {
                setMessage(" Group Created");
                setTimeout(() => {
                    navigate("/home");
                }, 500);
            } else {
                //alert(res.error || "Something went wrong");
                setMessage(res.errors)
            }
        } catch (err) {
            console.error("Error:", err);
        }
    }

    return (

        <div>
            <h2>Group</h2>
            <Form method='POST' onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter group name" value={name} name='name' onChange={(e) => setName(e.target.value)} />

                </Form.Group>

                <Form.Group className="mb-3" >
                    <Form.Label>Group Type</Form.Label>

                    <Form.Check // prettier-ignore
                        type="radio" label="Private " name='room_type' value='private' checked={room_type === 'private'} onChange={(e) => setRoomType(e.target.value)}
                    />
                    <Form.Check // prettier-ignore
                        type="radio" label="Public " name='room_type' value='public' checked={room_type === 'public'} onChange={(e) => setRoomType(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    )
}

export default CreateGroup