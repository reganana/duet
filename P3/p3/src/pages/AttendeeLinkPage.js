import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import '../assets/css/AttendeeLinkPage.css';

// !!!!!!!!!!!!!!!!!!!!!!!TOKEN NOT NEEDED FOR THIS PAGE!!!!!!!!!!!!!!!!!!!!!!!
function AttendeeLinkPage() {
    //get meeting info
    const [meetingInfo, setMeetingInfo] = useState(null);
    const { meetingId } = useParams();
    const  [userAvail, setUserAvail] = useState([]);
    
    /////////////////////////////////////////// Shuyan's code starts here //////////////////////////////
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState([]);
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDate.getDay());
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const isSmallScreen = screenWidth <= 600;

    const renderMeeting = (dayIndex, hour, minute, day, month, year) => {
        minute = minute === '00' ? 0 : 30;
        // Create a list to store JSX for meetings in this slot
        const meetingsInSlot = meetings.flatMap(m => {
            const meetingDate = new Date(m.deadline);
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
                    <div className="att-link-meeting">
                        <h3>{m.title}</h3>
                        <p>Location: {m.location}</p >
                    </div>
                );
            }
            return []; // Return an empty array to avoid issues with flatMap
        });

        // Check if there are meetings to display and wrap them in a single <td>
        if (meetingsInSlot.length > 0) {
            const tdKey = `td-${dayIndex}-${hour}-${minute}-${meetingsInSlot.meetingId}`;
            return (
                <td key={tdKey} className="att-link-meeting att-link-show" headers={`th-${dayIndex}`}>
                    {meetingsInSlot}
                </td>
            );
        } else {
            const tdKey = `td-${dayIndex}-${hour}-${minute}`;
            // Return an empty <td> if there are no meetings in the slot
            return (
                <td key={tdKey} className="att-link-show" headers={`th-${dayIndex}`}></td>
            );
        }
    };

    const adjustTableForScreenSize = () => {
        setScreenWidth(window.innerWidth);
    };

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
        if (isSmallScreen) {
            // setSelectedDayIndex((prev) => prev === 0 ? 6 : prev - 1);
            setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
        } else {
            setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleNextWeek = () => {
        if (isSmallScreen) {
            // setSelectedDayIndex((prev) => prev === 6 ? 0 : prev + 1);
            setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
        } else {
            setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
        }
    };
    /////////////////////////////////////////// Shuyan code ends  //////////////////////////////

        const renderAvailability = (dayIndex, hour, minute, day, month, year) => {
        // console.log("in");
        minute = minute === '00' ? 0 : 30;
        const slotTime = new Date(year, month, day, hour, minute, 0, 0); // Set slot's time
        // console.log("slotTime:", slotTime);
        // Filter user availability that matches the current slot
        if (Array.isArray(userAvail)) {
            const availabilityInSlot = userAvail.filter(avail => {
                const startDate = new Date(avail.date + 'T' + avail.start_time);
                // console.log("startDate:", startDate);
                return slotTime.getTime() === startDate.getTime();
            });

            console.log(availabilityInSlot);
        
            // Map over filtered availability to create JSX
            const NotUseavailabilityJSX = availabilityInSlot.map((avail, index) => (
                <div key={index} className={`att-link-availability-${avail.availability_level}`} />

            ));
        
            // If there are availability blocks to display, wrap them in a single <td>
            if (NotUseavailabilityJSX.length > 0) {
                const tdKey = `td-availability-${dayIndex}-${hour}-${minute}`;
                const availabilityJSX = availabilityInSlot.map((avail, index) => (
                    <td key={tdKey} className={`att-link-availability-${avail.availability_level} headers={th-${dayIndex}`}></td>
        
                ));
                return (availabilityJSX
                );
            } else {
                // Return null if no availability to avoid rendering empty slots
                return null;
            }
        }
    };
    
    /////////////////////////////////////////// Shuyan's code starts here //////////////////////////////
    // Update days when currentDate changes
    useEffect(() => {
        setDays(calculateDays());
    }, [currentDate]);

    useEffect(() => {
        const handleResize = () => adjustTableForScreenSize();
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    /////////////////////////////////////////// Shuyan code ends  //////////////////////////////
    
    useEffect(() => {
        // get meeting duration
        const fetchMeetingInfo = async () => {
            const response = await fetch(`http://localhost:8000/meeting/${meetingId}/`, {
                method: 'GET',    
                // headers: {
                //     'Authorization': `Bearer ${token}`,
                //     },
            });

            if (response.ok) {
                const data = await response.json();
                setMeetingInfo(data);
            } else {
                // Handle error
                console.error('Failed to fetch meeting info');
            }
        };

        fetchMeetingInfo();

        //get User availability
        const fetchUserAvailablity = async () => {
            const response = await fetch(`http://localhost:8000/meeting/${meetingId}/user_availability/`, {
                method: 'GET',
                // headers: {
                //     'Authorization': `Bearer ${token}`,
                //     },
            });

            if (response.ok) {
                const data = await response.json();
                setUserAvail(data);
                console.log(data);
            } else {
                // Handle error
                console.error('Failed to User Availability');
            }
        };

        fetchUserAvailablity();

    }, [meetingId]);

    if (!meetingInfo || !meetingInfo.user || !userAvail) {
        return <div>Loading...</div>;
    }



    //TODO: set contact availability(code from jiafei)

    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        <main className="AttendeeLinkPage">
            <div className="AttendeeLinkContainer">
                <div className="meeting_info">
                        <h2 className="attendee_h2">{meetingInfo.user.first_name} {meetingInfo.user.last_name} is inviting you to 1 on 1 meeting: {meetingInfo.title} </h2>
                        <h3 className="attendee_h3"> Meeting duration: {meetingInfo.duration} </h3>
                        <h3 className="attendee_h3"> Deadline to comfirm the meeting: {new Date(meetingInfo.deadline).toLocaleString('en-US', {
                                                                                            weekday: 'long', // "Monday"
                                                                                            year: 'numeric', // "2024"
                                                                                            month: 'long', // "March"
                                                                                            day: 'numeric', // "12"
                                                                                            hour: '2-digit', // "01"
                                                                                            minute: '2-digit', // "30"
                                                                                            second: '2-digit', // "00"
                                                                                            timeZoneName: 'short' // "GMT"
                                                                                        })} </h3>

                        <div className="attendee_link_to_busy_level">
                            {/* TODO: set contact availability here */}
                            {/* Once done, post meeting state as scheduling */}
                            <a className = "attendee_a"href={`http://18.119.164.105/ContactAvailability/${meetingId}/`} target="_blank"> Set your availability </a >
                        </div>
                </div><br />
                <hr className = "attendee_hr" />
                <h2 className="attendee_h2"> {meetingInfo.user.first_name} {meetingInfo.user.last_name}'s availability</h2>
                <div className="attendee_discription"> 
                    <p className = "attendee_free_time" id = "attendee_prefer"> Prefered to meet </p >
                    <p className = "attendee_free_time"> Less Prefered to meet</p >
                </div>

                {/* TODO:Add code for timetable rendering */}
                <div id="att-link-page-container">
                    <div id="att-link-content-wrap">
                        <div className="att-link-main">
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
                                    <th id="att-link-time-title" className="att-link-time-title show">Time</th>
                                    {/* Conditionally render day columns based on screen size */}
                                    {days.map((day, index) => isSmallScreen ? 
                                        (index === selectedDayIndex ? 
                                            <th key={index} className="att-link-day-column show">
                                            <div className="att-link-day">{day.toLocaleString('default', { weekday: 'long' })}</div>
                                            <div className="att-link-date">{day.getDate()}</div>
                                            </th> : null) : 
                                        <th key={index} className="att-link-day-column show">
                                            <div className="att-link-day">{day.toLocaleString('default', { weekday: 'long' })}</div>
                                            <div className="att-link-date">{day.getDate()}</div>
                                        </th>
                                    )}
                                </tr>
                                </thead>
                                <tbody id="att-link-scheduleBody">
                                {Array.from({ length: 48 }, (_, index) => { // 48 slots cover 24 hours with 30-minute intervals
                                    const hour = Math.floor(index / 2); // Now starts at 0:00
                                    const minute = index % 2 === 0 ? '00' : '30';
                                    const isPM = hour >= 12 && hour < 24; // Adjust PM flag for 24-hour format
                                    const displayHour = hour % 24; // Adjust for 24-hour format, wraps at 24 to 0

                                    return (
                                        <tr key={index}>
                                            {/* Time Column */}
                                            <td className="att-link-th-time show">{`${displayHour}:${minute}`}</td>

                                            {days.map((day, dayIndex) => {
                                                const availabilityCells = renderAvailability(dayIndex, hour, minute, day.getDate(), day.getMonth(), day.getFullYear());
                                                const meetingCells = renderMeeting(dayIndex, hour, minute, day.getDate(), day.getMonth(), day.getFullYear());

                                                // For small screens, only show the cell for the selected day
                                                if (isSmallScreen) {
                                                    if (dayIndex === selectedDayIndex) {
                                                        return availabilityCells ? availabilityCells : meetingCells;
                                                    } else {
                                                        return null; // Don't render cells for other days on small screens
                                                    }
                                                } else {
                                                    // For larger screens, show all cells, preferring availability blocks over meetings if both exist
                                                    return availabilityCells ? availabilityCells : meetingCells;
                                                }
                                            })}
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default AttendeeLinkPage;