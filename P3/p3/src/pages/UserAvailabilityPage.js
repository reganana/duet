import '../assets/css/UserAvailabilityPage.css';
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../context/SidebarContext';
import BusyLevel from '../components/Sidebar/busylevel';
import Header from '../components/Header';

function Availability() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayIndex, setSelectedDayIndex] = useState(currentDate.getDay());
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [meetings, setMeetings] = useState([]);
    const isSmallScreen = screenWidth <= 600;
    let allSubmissionsSuccessful = true;
    
    /////////////////////////////////////////// Handle Preferred-Level Button Click/////////////////
    const [preferredStatuses, setPreferredStatuses] = useState({});
    const [currentStatus, setCurrentStatus] = useState(null);

    const handlePreferredClick = () => {
        setCurrentStatus('preferred');
    };

    const handleLessPreferredClick = () => {
        setCurrentStatus('lesspreferred');
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////

   /////////////////////////////////////// CLICK ON CELL ///////////////////////////////////////////
    const handleCellClick = (cellId) => {
        setPreferredStatuses(prevStatuses => {
            const newStatuses = { ...prevStatuses };

            if (currentStatus === 'preferred') {
                if (newStatuses[cellId] === 'preferred') {
                    // Cell is already marked as preferred, remove the status
                    delete newStatuses[cellId];
                    newStatuses[cellId] = 'none';
                } else {
                    // Mark the cell as preferred
                    newStatuses[cellId] = 'preferred';
                }
            } else if (currentStatus === 'lesspreferred') {
                if (newStatuses[cellId] === 'lesspreferred') {
                    // Cell is already marked as preferred, remove the status
                    delete newStatuses[cellId];
                    newStatuses[cellId] = 'none';
                } else {
                    // Mark the cell as preferred
                    newStatuses[cellId] = 'lesspreferred';
                }
            }
            console.log(newStatuses);
            return newStatuses;
        });
        console.log(`Clicked on cell with ID: ${cellId}, Current Status: ${currentStatus}`);
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////////

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

    
    function constructCellIdFromBlock(block) {
        const blockDate = new Date(block.date + 'T' + block.start_time);
        const year = blockDate.getFullYear();
        const month = blockDate.getMonth() + 1;
        const date = blockDate.getDate();
        const hours = blockDate.getHours();
        const minutes = blockDate.getMinutes();
    
        const cellId = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}-${hours.toString().padStart(2, '0')}-${minutes.toString().padStart(2, '0')}`;
        return cellId;
    }


    // render availability blocks
    useEffect(() => {
        const fetchUserAvailability = async () => {
            const userToken = localStorage.getItem('accessToken');
            try {
                const response = await fetch('http://localhost:8000/availability/availability-list/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                });


                if (response.ok) {
                    const availabilityBlocks = await response.json();
                    const newStatuses = {};
                    availabilityBlocks.forEach(block => {
                        const cellId = constructCellIdFromBlock(block, days);
                        newStatuses[cellId] = block.availability_level;
                        console.log(newStatuses)
                    });
                    setPreferredStatuses(newStatuses);
                } else {
                    console.error('Failed to fetch availability blocks');
                }
            } catch (error) {
                console.error('Error fetching user availability:', error);
            }
        };


        fetchUserAvailability();
    }, []);

    ///////////////////////////////////////// Submit Form //////////////////////////////////////////////////////
    const handleSubmit = async () => {
        // Extracting each cell's availability information
        const availabilityBlocks = Object.keys(preferredStatuses).map((cellId) => {
            const [year, month, day, hour, minute] = cellId.split('-');
            const formattedDate = `${year}-${month}-${day}`;
            const startTime = `${hour}:${minute}:00`;
        
            let endTimeHour = parseInt(hour, 10);
            let endTimeMinute = parseInt(minute, 10) + 30; // Add 30 minutes for the end time
        
            if (endTimeMinute >= 60) {
                endTimeMinute -= 60; // Reset minutes to 0 after a 60-minute overflow
                endTimeHour += 1; // Increment the hour
            }
        
            const formattedEndTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}:00`;
        
            return {
                "availability_level": preferredStatuses[cellId],
                "date": formattedDate,
                "start_time": startTime,
                "end_time": formattedEndTime,
            };
        });
    
        console.log("Submitting the following data:", availabilityBlocks);
    
        const userToken = localStorage.getItem('accessToken');
        
        // Iterating over each availability block to send them one by one
        for (const block of availabilityBlocks) {
            try {
                const response = await fetch('http://localhost:8000/availability/availability-list/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify(block), // Sending one block at a time
                });
    
                if (!response.ok) {
                    console.error('Submission failed for block:', block);
                    allSubmissionsSuccessful = false;
                    break;
                }
    
                const jsonResponse = await response.json();
                console.log('Submission successful:', jsonResponse);
            } catch (error) {
                console.error('Error submitting form:', error);
                allSubmissionsSuccessful = false;
                break;
            }

            try {
                const userToken = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:8000/availability/availability-list/', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                  },
                  body: JSON.stringify(block),
                });
          
                if (response.ok) {
                  const jsonResponse = await response.json();
                  console.log('Submission successful:', jsonResponse);
                } else {
                  const errorResponse = await response.json();
                  console.error('Submission failed:', errorResponse);
                }
              } catch (error) {
                console.error('Error submitting form:', error);
              }

              try {
                const userToken = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:8000/availability/availability-list/', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                  },
                  body: JSON.stringify(block),
                });
          
                if (response.ok) {
                  const jsonResponse = await response.json();
                  console.log('Submission successful:', jsonResponse);
                } else {
                  const errorResponse = await response.json();
                  console.error('Submission failed:', errorResponse);
                }
              } catch (error) {
                console.error('Error submitting form:', error);
              }
        }

        alert("Your availability has been updated successfully!");
    };    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        <SidebarProvider initialVisibility={true}>
            <div id="cal-page-container">
                <Header />
                <div id="cal-content-wrap">
                    <BusyLevel handlePreferredClick={handlePreferredClick} 
                        handleLessPreferredClick={handleLessPreferredClick} />
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
                        <div id="availability-table">
                            <table>
                                <thead>
                                <tr>
                                    {/* Always show the Time column */}
                                    <th id="cal-time-title" className="cal-th-time show">Time</th>
                                    {/* Conditionally render day columns based on screen size */}
                                    {days.map((day, index) =>
                                        <th key={index} className="cal-day-column show">
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
                                            <td className="cal-th-time show">{`${displayHour}:${minute}`}</td>
                                            {days.map((day, dayIndex) => {
                                                const year = day.getFullYear();
                                                const month = day.getMonth() + 1;
                                                const date = day.getDate();
                                                const cellId = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}-${hour.toString().padStart(2, '0')}-${minute.toString().padStart(2, '0')}`;
                                                const cellClass = preferredStatuses[cellId] === 'preferred' ? 'preferred' : preferredStatuses[cellId] === 'lesspreferred' ? 'lesspreferred' : preferredStatuses[cellId] === 'none' ? 'none':'';
                                                return (
                                                    <td 
                                                        key={dayIndex} 
                                                        className={`cal-show ${cellClass}`} 
                                                        onClick={() => handleCellClick(cellId)}>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            </table>
                        </div>
                        <div className = "ua-footer">
                                <div id ="submit-button">
                                    <button onClick={handleSubmit}>Save</button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default Availability;
