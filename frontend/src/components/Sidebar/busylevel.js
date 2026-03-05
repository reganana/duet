import React, { useState, useEffect } from 'react';
import { useSidebarVisibility } from '../../context/SidebarContext';

function BusyLevel({ handlePreferredClick, handleLessPreferredClick, handleSubmit}) {
    const [user, setUser] = useState({ name: 'User Name', email: 'useremail@gmail.com' });
    const [selectedStatus, setSelectedStatus] = useState(null);

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

    /////////////////////////////////////// Test Cell Clickable ///////////////////////////////////////
    const handleCellClick = (cellIndex) => {
        console.log(`Timetable cell ${cellIndex} clicked!`);
        // You can perform any other action here
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    if (isVisible) {
        return (
            <div id="busylevel" className="busylevel">
                <div className="profile">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
                <div className="left-side-buttons">
                    {/* Use buttons for actions, and attach onClick handlers */}
                    <button className="free" onClick={handlePreferredClick}>Preferred to Meet</button>
                    <button className="busy" onClick={handleLessPreferredClick}>Less Preferred to Meet</button>
                </div>
            </div>
        );
    } else {
        return null;
    }
}

export default BusyLevel;

