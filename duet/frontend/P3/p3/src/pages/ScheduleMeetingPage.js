import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import '../assets/css/ScheduleMeetingPage.css';
import HeaderNoToggle from "../components/Header/NoToggle.js";

function ScheduleMeetingPage() {
    const navigate = useNavigate();
    //get meeting info
    const [meetingInfo, setMeetingInfo] = useState([]);
    const { meetingId } = useParams();
    const [selectedTime, setSelectedTime] = useState(''); // State for storing selected time
    const [overlapTime, setOverlapTime] = useState([]); // State for storing overlap time
    // State to track the selected time slots
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [processedOverlapTime, setProcessedOverlapTime] = useState([]); // State for storing processed overlap time

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


    function filterOverlapTime(overlapTime, meeting_info) {
        console.log("meeting_info.duration:", meeting_info.duration);
        
        if (meeting_info.duration === 30) {
            console.log("in");
            return overlapTime;
        }
        // Helper to convert date and time into a unified DateTime
        const toDateTime = (date, time) => new Date(`${date}T${time}`);
      
        // Sort blocks by start time
        overlapTime.sort((a, b) => toDateTime(a.date, a.start_time) - toDateTime(b.date, b.start_time));
      
        let validStartTimes = []; // To store start times of blocks that can host the meeting
      
        // Calculate the number of consecutive blocks needed for the meeting
        const blocksNeeded = meeting_info.duration / 30;
        console.log("blocksNeeded:", blocksNeeded);
        
        // Iterate through the blocks
        for (let i = 0; i < overlapTime.length; i++) {
          let sequenceEnd = toDateTime(overlapTime[i].date, overlapTime[i].end_time);
          let count = 1; // Current block counts as 1
          var preferred = 1;

          console.log("in i, overlapTime[i].availability_level:", count, overlapTime[i].availability_level, overlapTime[i].date, overlapTime[i].start_time);
      
          // Look ahead to find consecutive blocks
           
          for (let j = i + 1; j < overlapTime.length && count < blocksNeeded; j++) {
            let nextStart = toDateTime(overlapTime[j].date, overlapTime[j].start_time);
            let nextEnd = toDateTime(overlapTime[j].date, overlapTime[j].end_time);
      
            // Check if the next block is consecutive
            if (sequenceEnd.getTime() === nextStart.getTime()) {
                if (overlapTime[j].availability_level == "lesspreferred") {
                    console.log("in j, overlapTime[i].availability_level:", count, overlapTime[j].availability_level, overlapTime[j].date, overlapTime[j].start_time);
                    preferred = 0;
                }
                count++;
                sequenceEnd = nextEnd; // Update the end of the sequence
        
                // If we've found enough consecutive blocks
                if (count == blocksNeeded) {
                    let block = overlapTime[i];
                    console.log("Block:",count, overlapTime[j],block);
                    if (preferred === 0) {
                        block.availability_level = "lesspreferred";
                        preferred = 1;
                    }
                    validStartTimes.push(block);
                    break; // Stop looking ahead, move to the next block as a potential starting point
                }
            } else {
              break; // Not consecutive, break the look-ahead
            }
          }
        }
      
        return validStartTimes;
      }

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


    const handleSlotClick = (day, month, year, hour, minute) => {
        const isSelectedAlready = selectedSlot && selectedSlot.day === day && selectedSlot.month === month && selectedSlot.year === year && selectedSlot.hour === hour && selectedSlot.minute === minute;
        if (isSelectedAlready) {
            setSelectedSlot(null);
        } else {
            setSelectedSlot({ day, month, year, hour, minute });
        }
    };

    //Display the overlap time with two colors
    const renderAvailability = (dayIndex, hour, minute, day, month, year) => {
        // console.log("in");
        minute = minute === '00' ? 0 : 30;
        const slotTime = new Date(year, month, day, hour, minute, 0, 0); // Set slot's time

        // Filter user availability that matches the current slot
        if (processedOverlapTime.length === 0) {
            return null;
        }

        console.log(processedOverlapTime);
        const availabilityInSlot = processedOverlapTime.filter(overlap => {
            const startDate = new Date(overlap.date + 'T' + overlap.start_time);
            // console.log("startDate:", startDate);
            return slotTime.getTime() === startDate.getTime();
        });

        // console.log(availabilityInSlot);

        const isSelected = selectedSlot && selectedSlot.day === day && selectedSlot.month === month && selectedSlot.year === year && selectedSlot.hour === hour && selectedSlot.minute == minute;
        const slotClass = availabilityInSlot.length > 0 ?
            (isSelected ? `att-link-availability-${availabilityInSlot[0].availability_level} selected-time-slot` : `att-link-availability-${availabilityInSlot[0].availability_level}`) :
            'att-link-availability';

        // If there are availability blocks to display, wrap them in a single <td>
        if (availabilityInSlot.length > 0) {
            const tdKey = `td-availability-${dayIndex}-${hour}-${minute}`;
            return (
            <td key={tdKey} className={slotClass} onClick={() => handleSlotClick(day, month, year, hour, minute)} headers={`th-${dayIndex}`}>
            </td>
        );
        } else {
            // Return null if no availability to avoid rendering empty slots
            return null;
        }
        
    };

    
    useEffect(() => {
        // get meeting information to display
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

    }, [meetingId]);


    useEffect(() => {
        //get overlap time prepare for display
        const fetchOverlapTime = async () => {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8000/meeting/${meetingId}/overlap_time/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    },
            });

            if (response.ok) {
                console.log("fetch overlap time");
                const data = await response.json();
                console.log("data:", data);
                setOverlapTime(data);
                const filteredData = filterOverlapTime(data, meetingInfo);
                setProcessedOverlapTime(filteredData);
                console.log("filteredData:", filteredData);
                console.log("processedOverlapTime:", processedOverlapTime);
            } else {
                // Handle error
                console.error('Failed to fetch Overlap time');
            }
        };

        fetchOverlapTime();
    }, [meetingId, meetingInfo]);

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
    
    //TODO: after scheduled, the availability block should be deleted at backend

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            alert("Please select a time slot.");
            return;
        }
        const startTime = new Date(
            selectedSlot.year,
            selectedSlot.month,
            selectedSlot.day,
            selectedSlot.hour,
            selectedSlot.minute
        );

        const formattedStartTime = startTime.toISOString();
    
        const updatedMeetingInfo = { ...meetingInfo, scheduled_time: formattedStartTime, meeting_status: "Confirmed" };

        const userToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8000/meeting/${meetingId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`, // Example token usage
            },
            body: JSON.stringify(updatedMeetingInfo),
        });

        if (response.ok) {
        // Handle successful update
            console.log('Meeting updated successfully');
            alert("Meeting scheduled.");
            navigate('/contact');
        } else {
            console.error('Failed to update meeting');
        }
    }

    if (!meetingInfo) {
        return <div>Loading...</div>;
    }



    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return (
        
        <div> 
            <HeaderNoToggle />
            <main className="scheduleMeetingPage">
            <div className="schedule_container">
                <br /><br /><br /><br />
                <div className="schedule_meeting_info">
                    <h2 className="schedule_h2">Schedule meeting</h2>
                    <h3 className="schedule_h3"> Meeting duration: {meetingInfo.duration} minutes</h3>
                </div><br />
                <hr />
                <h2 className="schedule_h2"> Availabilities</h2>
                <h3 className="schedule_h3"> Select meeting time by clicking on the calendar.</h3>
                <div className="schedule_discription"> 
                    <p className = "schedule_free_time" id = "schedule_prefer"> Prefered to meet </p>
                    <p className = "schedule_free_time"> Less Prefered to meet</p>
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
                                    <th id="att-link-time-title" className="att-link-th-time show">Time</th>
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
                                            <td className="att-link-th-time show">{`${displayHour}:${minute} ${isPM ? 'PM' : 'AM'}`}</td>

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
                <br />
                <br />

                <form onSubmit={handleSubmit}>
                    {/* TODO: set setSelectedTime here */}
                    {/* <input type="datetime-local" onChange={(e) => setSelectedTime(e.target.value)} /> */}
                    
                    <div className="schedule_link_to_busy_level">
                        <button type="submit">Confirm</button>
                    </div>
                </form>
            </div>
            </main>
        </div>
  );

}

export default ScheduleMeetingPage;