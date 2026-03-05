import '../assets/css/AttendeeAvailabilityPage.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { SidebarProvider } from '../context/SidebarContext';
// import BusyLevel from '../components/Sidebar/busylevel';
// import Header from '../components/Header';

function AttendeeAvailabilityPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetingInfo, setMeetingInfo] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDate.getDay());
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const isSmallScreen = screenWidth <= 600;
    const { meetingId } = useParams();
    
    /////////////////////////////////////////// Handle Preferred-Level Button Click//////////////////////////////
    const [preferredStatuses, setPreferredStatuses] = useState({});
    const [currentStatus, setCurrentStatus] = useState(null);
    const [hasSubmittedAvailability, setHasSubmittedAvailability] = useState(false);

    const handlePreferredClick = () => {
        setCurrentStatus('preferred');
    };

    const handleLessPreferredClick = () => {
        setCurrentStatus('lesspreferred');
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////

   /////////////////////////////////////// CLICK ON CELL ///////////////////////////////////////////
    const handleCellClick = (hour, minute, isPM, dayIndex) => {
        const weekday = days[dayIndex].toLocaleString('default', { weekday: 'long' });
        const date = days[dayIndex].getDate();
        const month = days[dayIndex].getMonth() + 1; // getMonth() is zero-indexed
        const year = days[dayIndex].getFullYear();
        const cellId = `${dayIndex}-${hour}-${minute}-${isPM ? 'PM' : 'AM'}`;

        // Calculate the end time by adding 30 minutes to the start time
        let endHour = hour;
        let endMinute = parseInt(minute) + 30; // Ensure minute is treated as a number and add 30
        let endIsPM = isPM;
        
        // Adjust hour and AM/PM if necessary
        if (endMinute >= 60) {
            endMinute -= 60; // Subtract 60 minutes to get the remainder
            endHour += 1; // Increment the hour

            // Check if we need to switch from AM to PM or PM to AM
            if (endHour === 12) {
                endIsPM = !isPM; // Flip AM/PM
            } else if (endHour > 12) {
                endHour -= 12; // Convert to 12-hour format
                if (!isPM) { // Only flip AM/PM if we're transitioning from AM to PM
                    endIsPM = !isPM;
                }
            }
        }

        // Format minutes to ensure two digits
        const formattedEndMinute = endMinute.toString().padStart(2, '0');
        
        const start_time = `${hour}:${minute} ${isPM ? 'PM' : 'AM'}`;
        const end_time = `${endHour}:${formattedEndMinute} ${endIsPM ? 'PM' : 'AM'}`;

        setPreferredStatuses(prevStatuses => {
            const newStatuses = { ...prevStatuses };

            if (currentStatus === 'preferred') {
                if (newStatuses[cellId] === 'preferred') {
                    // Cell is already marked as preferred, remove the status
                    delete newStatuses[cellId];
                } else {
                    // Mark the cell as preferred
                    newStatuses[cellId] = 'preferred';
                }
            } else if (currentStatus === 'lesspreferred') {
                if (newStatuses[cellId] === 'lesspreferred') {
                    // Cell is already marked as preferred, remove the status
                    delete newStatuses[cellId];
                } else {
                    // Mark the cell as preferred
                    newStatuses[cellId] = 'lesspreferred';
                }
            }
            console.log(newStatuses);
            return newStatuses;
        });

        console.log(`Clicked on cell. StartTime: ${start_time}, EndTime: ${end_time}, Date: ${date}/${month}/${year}, Weekday: ${weekday}`);
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////

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

    useEffect(() => {
        const fetchAvailabilityStatus = async () => {
            const response = await fetch(`http://localhost:8000/availability/${meetingId}/contact_availability/`);
            const data = await response.json();
            // If the response data is not empty, update the state
            if (data && data.length > 0) {
                setHasSubmittedAvailability(true);
                alert('You have already submitted your availability for this meeting.');
            }
        };

        fetchAvailabilityStatus();
    }, [meetingId]);

    ///////////////////////////////////////// Submit Form //////////////////////////////////////////////////////
    const handleSubmit = async () => {

        if (hasSubmittedAvailability) {
            alert('You have already submitted your availability for this meeting.');
            return;
        }

        // Extracting each cell's availability information
        const availabilityBlocks = Object.keys(preferredStatuses).map((cellId) => {
            const [dayIndex, hour, minute, amPm] = cellId.split('-');
            const date = days[parseInt(dayIndex)];
            const preferenceLevel = preferredStatuses[cellId];
            
            // Formatting the date and time according to your backend's expectations
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const startTime = `${hour}:${minute}:00`;
            let endTimeHour = parseInt(hour);
            let endTimeMinute = parseInt(minute) + 30;
            
            // Adjusting minutes and hours for the end time
            if (endTimeMinute >= 60) {
                endTimeMinute -= 60;
                endTimeHour += 1;
            }
    
            const endTime = `${String(endTimeHour).padStart(2, '0')}:${String(endTimeMinute).padStart(2, '0')}:00`;
    
            // Return a single object per availability block
            return {
                "availability_level": preferenceLevel,
                "date": formattedDate,
                "start_time": startTime,
                "end_time": endTime,
            };
        });
    
        console.log("Submitting the following data:", availabilityBlocks);
        
        // Iterating over each availability block to send them one by one

        try {
            const response = await fetch(`http://localhost:8000/availability/${meetingId}/contact_availability/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(availabilityBlocks), // Sending one block at a time
            });

            if (!response.ok) {
                // Handle response error
                console.error('Submission failed for block:', availabilityBlocks);
            }else{
                alert('Availability submitted successfully');
                console.log('Submission successful:', jsonResponse);
            }

            const jsonResponse = await response.json();

            
            // Handle success response
        } catch (error) {
            console.error('Error submitting form:', error);
        }

        // Patch contact availability and meeting state to shceduling
        const updatedMeetingInfo = { ...meetingInfo, meeting_status: "Scheduling" };

        const response = await fetch(`http://localhost:8000/meeting/${meetingId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMeetingInfo),
        });

        if (response.ok) {
        // Handle successful update
        console.log('Meeting updated successfully');
        } else {
            console.error('Failed to update meeting');
        }

    };



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        <div id="contact-cal-page-container">
            <div id="contact-cal-content-wrap">
                <div className="contact-cal-main">
                    <div className="cal-month-week">
                        <div className="cal-month-title">
                            <h1 id="cal-month-year">{months[currentMonth]} {currentYear}</h1>
                        </div>
                        <div id="ContactBusylevel" className="ContactBusylevel">
                            <div className="ContactButtons">
                                {/* Use buttons for actions, and attach onClick handlers */}
                                <button className="ContactFree" onClick={handlePreferredClick}>Preferred to Meet</button>
                                <button className="ContactBusy" onClick={handleLessPreferredClick}>Less Preferred to Meet</button>
                                <button id = "contact-submit-button" onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>
                        <div className="cal-month-controls">
                            <button id="cal-prev-week/day" className="cal-button" onClick={handlePrevWeek}>&lt;</button>
                            <button id="cal-today" className="cal-button" onClick={handleToday}>Today</button>
                            <button id="cal-next-week/day" className="cal-button" onClick={handleNextWeek}>&gt;</button>
                        </div>
                    </div>
                    <div id="contact-availability-table">
                        <table>
                            <thead>
                            <tr>
                                {/* Always show the Time column */}
                                <th id="contact-cal-time-title" className="contact-cal-th-time show">Time</th>
                                {/* Conditionally render day columns based on screen size */}
                                {days.map((day, index) => isSmallScreen ? 
                                    (index === selectedDayIndex ? 
                                        <th key={index} className="contact-cal-day-column show">
                                        <div className="contact-cal-day">{day.toLocaleString('default', { weekday: 'long' })}</div>
                                        <div className="contact-cal-date">{day.getDate()}</div>
                                        </th> : null) : 
                                    <th key={index} className="contact-cal-day-column show">
                                        <div className="contact-cal-day">{day.toLocaleString('default', { weekday: 'long' })}</div>
                                        <div className="contact-cal-date">{day.getDate()}</div>
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody id="contact-scheduleBody">
                            {Array.from({ length: 48 }, (_, index) => { // 48 slots cover 24 hours with 30-minute intervals
                                const hour = Math.floor(index / 2); // Now starts at 0:00
                                const minute = index % 2 === 0 ? '00' : '30';
                                const isPM = hour >= 12 && hour < 24; // Adjust PM flag for 24-hour format
                                const displayHour = hour % 24; // Adjust for 24-hour format, wraps at 24 to 0

                                return (
                                    <tr key={index}>
                                        <td className="contact-cal-th-time show">{`${displayHour}:${minute}`}</td>
                                        {days.map((day, dayIndex) => {
                                            // Generate a unique ID for each cell to track its status
                                            const cellId = `${dayIndex}-${hour}-${minute}-${isPM ? 'PM' : 'AM'}`;
                                            // Determine the cell's class based on its status in preferredStatuses
                                            const cellClass = preferredStatuses[cellId] === 'preferred' ? 'preferred' : preferredStatuses[cellId] === 'lesspreferred' ? 'lesspreferred' : '';
                                            return (
                                                <td 
                                                    key={dayIndex} 
                                                    className={`contact-cal-show ${cellClass}`} 
                                                    onClick={() => handleCellClick(hour, minute, isPM, dayIndex)}
                                                >
                                                    {/* Optional content inside the cell */}
                                                </td>
                                            );
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

    );
}

export default AttendeeAvailabilityPage;
