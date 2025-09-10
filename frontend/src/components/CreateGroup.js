
// import { useState } from 'react';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import { createGroup } from '../api';
// import { Link, useNavigate } from "react-router-dom";

// const CreateGroup = ({onClose}) => {

//     const [message, setMessage] = useState("");
//     const [name, setName] = useState('')
//     const [room_type, setRoomType] = useState('')
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = { name, room_type }
//         //console.log(formData)
//         try {
//             const res = await createGroup(formData);
//             if (res && !res.errors) {
//                 setMessage(" Group Created");
//                 setTimeout(() => {
//                    if (onClose) onClose();
//                    navigate(0)
//                 }, 500);
//             } else {
//                 //alert(res.error || "Something went wrong");
//                 setMessage(res.errors)
//             }
//         } catch (err) {
//             console.error("Error:", err);
//         }
//     }

//     return (

//         <div>
//             <h2>Group</h2>
//             <Form method='POST' onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3" controlId="formBasicEmail">
//                     <Form.Label>Group Name</Form.Label>
//                     <Form.Control type="text" placeholder="Enter group name" value={name} name='name' onChange={(e) => setName(e.target.value)} />

//                 </Form.Group>

//                 <Form.Group className="mb-3" >
//                     <Form.Label>Group Type</Form.Label>

//                     <Form.Check 
//                         type="radio" label="Private " name='room_type' value='private_group' checked={room_type === 'private_group'} onChange={(e) => setRoomType(e.target.value)}
//                     />
//                     <Form.Check 
//                         type="radio" label="Public " name='room_type' value='public' checked={room_type === 'public'} onChange={(e) => setRoomType(e.target.value)}
//                     />
//                 </Form.Group>

//                 <Button variant="primary" type="submit">
//                     Submit
//                 </Button>
//             </Form>
//         </div>
//     )
// }

// export default CreateGroup




import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createGroup, getUsers } from '../api';
import { useNavigate } from "react-router-dom";

const CreateGroup = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [name, setName] = useState('');
    const [room_type, setRoomType] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user list when component mounts
        (async () => {
            try {
                const res = await getUsers();
               // console.log("res",res)
                setUsers(res );
                //console.log("users ",users)
            } catch (err) {
                console.error("Failed to load users", err);
            }
        })();
    }, []);

    const handleUserSelection = (e) => {
        const userId = parseInt(e.target.value);
        if (e.target.checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name,
            room_type,
            participant_id: room_type === 'private_group' ? selectedUsers : [],
        };

        try {
            const res = await createGroup(formData);
             
            if (res && !res.errors) {
               
                setMessage("Group Created Successfully");
                setTimeout(() => {
                    if (onClose) onClose();
                    navigate(0);
                }, 500);
            } else {
                setMessage(res.errors);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };
 
    return (
        <div>
            <h2>Create Group</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter group name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Group Type</Form.Label>
                    <Form.Check
                        type="radio"
                        label="Private Group"
                        name="room_type"
                        value="private_group"
                        checked={room_type === 'private_group'}
                        onChange={(e) => setRoomType(e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label="Public Group"
                        name="room_type"
                        value="public"
                        checked={room_type === 'public'}
                        onChange={(e) => setRoomType(e.target.value)}
                    />
                </Form.Group>

                {room_type === 'private_group' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Select Users</Form.Label>
                        {users.map((user) => (
                            <Form.Check
                                key={user.id}
                                type="checkbox"
                                label={`${user.name} (${user.email})`}
                                value={user.id}
                                onChange={handleUserSelection}
                            />
                        ))}
                    </Form.Group>
                )}

                <Button type="submit" variant="primary">Create Group</Button>

                {message && <div className="mt-3 text-success">{message}</div>}
            </Form>
        </div>
    );
};

export default CreateGroup;
