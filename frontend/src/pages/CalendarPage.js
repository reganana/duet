import '../assets/css/calendar.css';
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../context/SidebarContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Calendar() {
    // const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState([]);
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDate.getDay());
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    // const isSmallScreen = screenWidth <= 600;

    useEffect(() => {
        // Get the root element
        const root = document.getElementById('root');
        const body = document.body;
        
        // Save the current display style to restore it later
        const originalDisplay = root.style.display;
        const originalPosition = root.style.position;
        const originalWidth = root.style.width;
        const originalMinHeight = root.style.minHeight;

        const originalBodyDisplay = body.style.display;
        const originalBodyHeight = body.style.height;
        
        // Apply the new styles
        root.style.display = 'flex';
        root.style.position = 'relative';
        root.style.width = '100%';
        root.style.minHeight = '100vh';

        body.style.display = 'flex';
        body.style.height = '100vh';
    
        // Revert the styles
        return () => {
            root.style.display = originalDisplay;
            root.style.position = originalPosition;
            root.style.width = originalWidth;
            root.style.minHeight = originalMinHeight;

            body.style.display = originalBodyDisplay;
            body.style.height = originalBodyHeight;
        };
      }, []);

    // useEffect(() => {
    //     fetch('http://localhost:8000/meetings')
    //     .then(response => response.json())
    //     .then(data => {
    //         setMeetings(data); // Assume data is an array of meeting objects
    //     })
    //     .catch(error => console.error('Error fetching meetings:', error));
    // }, []);
    useEffect(() => {
        const fetchConfirmedMeetings = async () => {
            const userToken = localStorage.getItem('accessToken');
            //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE3NTk3MTM1LCJpYXQiOjE3MTI0MTMxMzUsImp0aSI6ImZlYzU4MWQ2NmQ3NTQ0NzU5Yjc4NjQyODc4NmJkZTZjIiwidXNlcl9pZCI6NX0.BeoNYvmXkuZjr-L9GIbGqIUmGwYywGpir3AR01R4fq8";
            const response = await fetch('http://localhost:8000/meeting/', {
                method: 'GET',   
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                // const processedMeetings = preprocessMeetings(data); // Assuming preprocessMeetings takes 'data' as input
                setMeetings(data);
            } else {
                // Handle error
                console.error('Failed to fetch confirmed meetings.');
            }
        };
    
        fetchConfirmedMeetings();
    }, []);

    // const preprocessMeetings = (meetingsData) => {
    //     return meetingsData.map(meeting => {
    //         const start = new Date(meeting.deadline);
    //         const end = new Date(start.getTime() + meeting.duration * 60000);
    //         return { ...meeting, start, end };
    //     });
    // };    
    
    // const renderMeeting = (hour, minute, day, month, year) => {
    //     const slotStart = new Date(year, month, day, hour, minute);
    //     const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

    //     minute = minute === '00' ? 0 : 30;
    
    //     // Find a meeting that overlaps this slot
    //     const meeting = meetings.find(m => {
    //         const meetingDay = m.start.getDate();
    //         return day === meetingDay &&
    //                ((m.start <= slotStart && m.end > slotStart) ||
    //                 (m.start >= slotStart && m.start < slotEnd));
    //     });
    
    //     if (meeting && slotStart >= meeting.start && slotStart < meeting.end) {
    //         const durationSlots = (meeting.end - meeting.start) / (30 * 60000);
    //         const isStartOfMeeting = meeting.start.getHours() === hour && meeting.start.getMinutes() === minute;
    
    //         // Render only at the start of the meeting, and span across the duration
    //         if (isStartOfMeeting) {
    //             return (
    //                 <div className="meeting" style={{ gridColumnEnd: `span ${durationSlots}` }}>
    //                     <h3>{meeting.title}</h3>
    //                     <p>Location: {meeting.location}</p>
    //                 </div>
    //             );
    //         }
    //     }
    
    //     // Return null if not the start of a meeting or no meeting in this slot
    //     return null;
    // };

    const renderMeeting = (dayIndex, hour, minute, day, month, year) => {
        minute = minute === '00' ? 0 : 30;
        // Create a list to store JSX for meetings in this slot
        const meetingsInSlot = meetings.flatMap(m => {
            const meetingDate = new Date(m.scheduled_time);
            const meetingYear = meetingDate.getFullYear();
            const meetingMonth = meetingDate.getMonth();
            const meetingDay = meetingDate.getDate();
            const meetingHour = meetingDate.getHours();
            const meetingMinute = meetingDate.getMinutes();
            const meetingDuration = m.duration; // Assuming this is in minutes
            const meetingId = m.id;

            // Calculate meeting's end time
            const endTime = new Date(meetingDate.getTime() + meetingDuration * 60000);

            // Check if the slot falls within the meeting's duration
            const slotTime = new Date(year, month, day, hour, minute, 0, 0); // Set slot's time

            if (meetingYear === year && meetingMonth === month && meetingDay === day && slotTime >= meetingDate && slotTime < endTime) {
                return (
                    <div className="cal-meeting">
                        <h3>{m.title}</h3>
                        <p>Location: {m.location}</p>
                    </div>
                );
            }
            return []; // Return an empty array to avoid issues with flatMap
        });

        // Check if there are meetings to display and wrap them in a single <td>
        if (meetingsInSlot.length > 0) {
            const tdKey = `td-${dayIndex}-${hour}-${minute}-${meetingsInSlot.meetingId}`;
            return (
                <td key={tdKey} className="cal-meeting cal-show" headers={`th-${dayIndex}`}>
                    {meetingsInSlot}
                </td>
            );
        } else {
            const tdKey = `td-${dayIndex}-${hour}-${minute}`;
            // Return an empty <td> if there are no meetings in the slot
            return (
                <td key={tdKey} className="cal-show" headers={`th-${dayIndex}`}></td>
            );
        }
    
        //     // Calculate meeting's end time
        //     const endTime = new Date(meetingDate.getTime() + meetingDuration * 60000);
            
        //     // Check if the slot falls within the meeting's duration
        //     const slotTime = new Date(meetingDate);
        //     slotTime.setHours(hour, minute, 0, 0); // Set slot's time
    
        //     if (meetingYear === year && meetingMonth === month && meetingDay === day && slotTime >= meetingDate && slotTime < endTime) {

        //         return (
        //             <td key={dayIndex} className="cal-meeting cal-show" headers={`th-${dayIndex}`}>
        //                 <h3>{m.title}</h3>
        //                 <p>Location: {m.location}</p>
        //             </td>
        //             // <div className="cal-meeting">
        //             //     <h3>{m.title}</h3>
        //             //     <p>Location: {m.location}</p>
        //             // </div>
        //         );
        //     }
        //     return (
        //         <td key={dayIndex} className="cal-show" headers={`th-${dayIndex}`}></td>
        //     );
        // });
    
        // return meetingsInSlot.length > 0 ? meetingsInSlot : null;
    };

    // const adjustTableForScreenSize = () => {
    //     setScreenWidth(window.innerWidth);
    // };

    const getStartOfWeek = (date) => {
        const result = new Date(date);
        result.setDate(result.getDate() - result.getDay());
        return result;
    };

    const calculateDays = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        return Array.from({ length: 7 }).map((_, index) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + index);
            return day;
        });
    };

    const [days, setDays] = useState(calculateDays());

    const handlePrevWeek = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleNextWeek = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    };

    // Update days when currentDate changes
    useEffect(() => {
        setDays(calculateDays());
    }, [currentDate]);

    // useEffect(() => {
    //     const handleResize = () => adjustTableForScreenSize();
    //     window.addEventListener('resize', handleResize);

    //     // Cleanup
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }, []);

    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        <SidebarProvider initialVisibility={true}>
            <div id="cal-page-container">
                <Header />
                <div id="cal-content-wrap">
                    <Sidebar />
                    <div className="cal-main">
                        <div className="cal-month-week">
                            <div className="cal-month-title">
                                <h1 id="cal-month-year">{months[currentMonth]} {currentYear}</h1>
                            </div>
                            <div className="cal-month-controls">
                                <button id="cal-prev-week/day" className="cal-button" onClick={handlePrevWeek}>&lt;</button>
                                <button id="cal-today" className="cal-button" onClick={handleToday}>Today</button>
                                <button id="cal-next-week/day" className="cal-button" onClick={handleNextWeek}>&gt;</button>
                           </div>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                {/* Always show the Time column */}
                                <th id="cal-time-title" className="cal-th-time">Time</th>
                                {/* Conditionally render day columns based on screen size */}
                                {days.map((day, index) =>
                                    <th key={index} className="cal-day-column">
                                        <div className="cal-day">{day.toLocaleString('default', { weekday: 'long' })}</div>
                                        <div className="cal-date">{day.getDate()}</div>
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody id="scheduleBody">
                            {Array.from({ length: 48 }, (_, index) => { // 48 slots cover 24 hours with 30-minute intervals
                                const hour = Math.floor(index / 2); // Now starts at 0:00
                                const minute = index % 2 === 0 ? '00' : '30';
                                const isPM = hour >= 12 && hour < 24; // Adjust PM flag for 24-hour format
                                const displayHour = hour % 24; // Adjust for 24-hour format, wraps at 24 to 0

                                return (
                                    <tr key={index}>
                                        {/* Time Column */}
                                        <td className="cal-th-time">{`${displayHour}:${minute}`}</td>

                                        {days.map((day, dayIndex) => (
                                                renderMeeting(dayIndex, hour, minute, day.getDate(), day.getMonth(), day.getFullYear())
                                        ))}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default Calendar;
