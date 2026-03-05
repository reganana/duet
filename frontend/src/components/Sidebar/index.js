import React, { useState, useEffect } from 'react';
import { useSidebarVisibility } from '../../context/SidebarContext';

function Sidebar() {
    const [user, setUser] = useState({ name: 'User Name', email: 'useremail@gmail.com' });

    useEffect(() => {
        const fetchUserProfile = async () => {
            //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE3NTk3MTM1LCJpYXQiOjE3MTI0MTMxMzUsImp0aSI6ImZlYzU4MWQ2NmQ3NTQ0NzU5Yjc4NjQyODc4NmJkZTZjIiwidXNlcl9pZCI6NX0.BeoNYvmXkuZjr-L9GIbGqIUmGwYywGpir3AR01R4fq8";
            const userToken = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/accounts/', {
                method: 'GET',   
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                const name = data.first_name + ' ' + data.last_name;
                const email = data.email;
                setUser({ name: name, email: email});
            } else {
                // Handle error
                console.error('Failed to fetch user profile.');
            }
        };

        fetchUserProfile();
    }, []);

    const { isVisible } = useSidebarVisibility();

    if (isVisible) {
        return (
            <div id="sidebar" className="sidebar">
                <div className="profile">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
                <div className="left-side-buttons">
                    <a href="/CreateNewMeetingPage" className="new-meeting">+ New Meeting</a>
                    <a href="/Availability" className="set-time">Set Your Availability</a>
                    </div>
            </div>
        );
    } else {
        return null;
    }
}

export default Sidebar;
