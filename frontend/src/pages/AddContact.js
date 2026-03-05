import React from 'react'
import '../assets/css/add_new_contact.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 


function AddContact() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate(); 
    const token = localStorage.getItem('accessToken');


    const handleSubmit = (e) => {
        e.preventDefault();
        

        fetch('http://localhost:8000/contacts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Contact added successfully');
                navigate('/contact'); // Redirect to contact page
            } 
            else {
                console.error('Failed to add contact');
            }
        })
        .catch(error => {
            console.error('Error adding contact:', error);
        });
    };

    const handleCancel = () => {
       navigate('/contact');
    };



    return (
    <div className='addcontact-main'>
        <div className="addcontact-form-container">
            <h1>Add New Contact</h1>
        <form onSubmit={handleSubmit}>
            <div className="contact-container">
            <label htmlFor="firstName" style={{ textAlign: 'left' }}>
               <b>First name</b>
                <input type="text" name="name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label htmlFor="lastName" style={{ textAlign: 'left' }}>
               <b>Last Name</b> 
                <input type="text"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required />
            </label>
            <label htmlFor="email" style={{ textAlign: 'left' }}>
               <b> Email</b>
                <input type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
            </label>

            <div className='addcontact-button-container'>
            <button className="addcontact-button" type="submit">Save</button>
            <button className="addcontact-button" onClick={handleCancel}>Cancel</button>
            </div>
            </div>
        </form>
         </div>
    </div>

    );






}

export default AddContact;