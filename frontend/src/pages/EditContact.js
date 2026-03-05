import React from 'react'
import '../assets/css/add_new_contact.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useParams } from 'react-router-dom';

function EditContact() {
    let { contactId } = useParams();
    const [contact, setContact] = useState({});
    const navigate = useNavigate(); 
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
         fetch(`http://localhost:8000/contacts/${contactId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
            .then(response => response.json())
            .then(data => setContact(data))
            .catch(error => console.error('Error:', error));
    }, [contactId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContact(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:8000/contacts/${contactId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(contact)
        })
        .then(response => response.json())
         .then(data => {
            console.log('Success:', data);
            navigate('/contact'); 
        })
        .catch(error => console.error('Error:', error));
    };
     const handleCancel = () => {
       navigate('/contact');
    };


    return (
     <div className='addcontact-main'>
    <div className="addcontact-form-container">
        <h1>Edit Contact</h1>
        <form onSubmit={handleSubmit}>
            <div className="contact-container">
                <label htmlFor="firstName" style={{ textAlign: 'left' }}>
                    First Name
                    <input type="text" name="first_name" value={contact.first_name || ''} onChange={handleInputChange} />
                </label>
                <label htmlFor="lastName" style={{ textAlign: 'left' }}>
                    Last Name
                    <input type="text" name="last_name" value={contact.last_name || ''} onChange={handleInputChange} />
                </label>
                <label htmlFor="email" style={{ textAlign: 'left' }}>
                    Email
                    <input type="email" name="email" value={contact.email || ''} onChange={handleInputChange} />
                </label>
                <div className='addcontact-button-container'>
                <button className="addcontact-button" type="submit">Update</button>
                <button className="addcontact-button" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </form>
    </div>
    </div>
    );

     


}

export default EditContact