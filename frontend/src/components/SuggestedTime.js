import React, { useState, useEffect } from 'react';
import '../assets/css/contact.css';
import { Link } from 'react-router-dom';

function SuggestedTime({ meetingId, meetingInfo, onSelectedSlotChange}) {
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState([]);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {

        //get overlap time prepare for display
        const fetchOverlapTime = async () => {
    
            const response = await fetch(`http://localhost:8000/meeting/${meetingId}/overlap_time/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    },
            });

            if (response.ok) {
                const data = await response.json();
                const selectedSlots = processAndSetTimeSlots(data);
                setSelectedTimeSlots(selectedSlots);
            } else {
                console.error('Failed to fetch Overlap time');
            }
        };

        fetchOverlapTime();

    }, [meetingId, meetingInfo.duration]);

    function filterOverlapTime(overlapTime, meeting_info) {
        console.log("meeting_info.duration:", meeting_info.duration);
        
        if (meeting_info.duration == 30) {
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
      
        // Iterate through the blocks
        for (let i = 0; i < overlapTime.length; i++) {
          let sequenceEnd = toDateTime(overlapTime[i].date, overlapTime[i].end_time);
          let count = 1; // Current block counts as 1
      
          // Look ahead to find consecutive blocks
          for (let j = i + 1; j < overlapTime.length && count < blocksNeeded; j++) {
            let nextStart = toDateTime(overlapTime[j].date, overlapTime[j].start_time);
            let nextEnd = toDateTime(overlapTime[j].date, overlapTime[j].end_time);
      
            // Check if the next block is consecutive
            if (sequenceEnd.getTime() === nextStart.getTime()) {
              count++;
              sequenceEnd = nextEnd; // Update the end of the sequence
      
              // If we've found enough consecutive blocks
              if (count === blocksNeeded) {
                validStartTimes.push(overlapTime[i]);
                break; // Stop looking ahead, move to the next block as a potential starting point
              }
            } else {
              break; // Not consecutive, break the look-ahead
            }
          }
        }
      
        return validStartTimes;
      }


    const processAndSetTimeSlots = (data) => {
        console.log(data);

        if (data.message === "No overlapping times found.") {
            setSelectedSlot([]);
            return;
        }

        const filteredTime = filterOverlapTime(data, meetingInfo);
   
        // Filter time slots by availability level
        if(filteredTime.length === 0) {
            setSelectedSlot([]);
            return;
        }

        const preferred = filteredTime.filter(slot => slot.availability_level === "preferred");
        const lessPreferred = filteredTime.filter(slot => slot.availability_level !== "preferred");
     
        console.log(preferred);
        console.log(lessPreferred);


        // Randomly select time slots
        let selectedSlots = selectRandomSlots(preferred, 3);

        // If there are not enough preferred slots, fill from lessPreferred
        if (selectedSlots.length < 3) {
            const additionalSlots = selectRandomSlots(lessPreferred, 3 - selectedSlots.length);
            selectedSlots = selectedSlots.concat(additionalSlots);
        }
        
        return selectedSlots;

    };

    const selectRandomSlots = (slots, n) => {
        // Shuffle array using Durstenfeld shuffle algorithm
        for (let i = slots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [slots[i], slots[j]] = [slots[j], slots[i]];
        }
        return slots.slice(0, n);
    };
    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
        onSelectedSlotChange(slot);
    };

    const handleShowConcatAvailClick = () => {
    
    window.open(`http://18.119.164.105/View-Contact-Availability/${meetingId}`, '_blank');
    };


    if (!selectedTimeSlots) {
        return (
        <div>
            <p>No suggested times available, see contact availability and update your availability </p>

            <button id="suggested-time-button" onClick={handleShowConcatAvailClick}>
            Contact Availability
            </button>
        </div>
        ); 
    }

   



    return (
        <div className="suggested-time-buttons-container">
    {selectedTimeSlots.map((slot, index) => (
        <button key={index} id="suggested-time-button"
        style={{ backgroundColor: selectedSlot === slot ? 'deepskyblue' : '#4ea6e0' }}
                    onClick={() => handleSelectSlot(slot)}
                    disabled={selectedSlot === slot}
        >
             {`${slot.date} ${slot.start_time}`}
        </button>
    ))}
    {selectedTimeSlots.length === 3 &&(

        <button id="suggested-time-button">
        <Link to={`http://18.119.164.105/ScheduleMeetingPage/${meetingId}`}>
            More time
        </Link>
        </button>
    )
}
    
    </div>
    );
}

export default SuggestedTime;
