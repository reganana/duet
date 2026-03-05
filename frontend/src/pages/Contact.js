import React from 'react'
import '../assets/css/contact.css';
import { useState, useEffect } from 'react';
import contactBookImage from '../assets/img/contactbook.png';
import addContactImage from '../assets/img/add.png';
import deleteContactImage from '../assets/img/delete.png';
import editContactImage from '../assets/img/edit.png';
import { Link } from 'react-router-dom';
import SuggestedTime from '../components/SuggestedTime';
import ToggleContact from "../components/Header/ToggleContact";
function ContactList() {
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [contactDetails, setContactDetails] = useState(null);
    const [filter, setFilter] = useState('');
    const [activeOption, setActiveOption] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [activeMeetingId, setActiveMeetingId] = useState(null);
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState([]);
    const [isMeetingTypeClickSuccess, setMeetingTypeClickSuccess] = useState(false);

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isMeetingListHidden, setIsMeetingListHidden] = useState(false);

    const token = localStorage.getItem('accessToken');


      const fetchContacts = () => {
       
        fetch('http://localhost:8000/contacts/', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
            .then(response => response.json())
            .then(data => {
                setContacts(data.filter(contact => contact.first_name.toLowerCase().includes(filter.toLowerCase()) || contact.last_name.toLowerCase().includes(filter.toLowerCase())));
            })
            .catch(error => {
                console.error('Error fetching contacts:', error);
            });
    };
    useEffect(() => {
        fetchContacts();
    }, [filter]);

    const handleContactClick = (contactId) => {
        setActiveContact(contactId); 
        showContact(contactId);
        setActiveOption(null);
        setMeetings([]);
        setMeetingDetails(null);
        setMeetingTypeClickSuccess(false);
    };

    const showContact = (contactId) => {
        fetch(`http://localhost:8000/contacts/${contactId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
            .then(response => response.json())
            .then(contact => {
                setContactDetails(contact);
            })
            .catch(error => {
                console.error('Error fetching contact details:', error);
            });
    };

    const handleMeetingTypeClick = (contactId,option) => {
        setActiveOption(option);
        setMeetingDetails(null);
        fetch(`http://localhost:8000/contacts/${contactId}/meetings/${option}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
            .then(response => response.json())
            .then(data => {
                setMeetings(data);
                console.log(meetings);
                
                if (Array.isArray(data) && data.length !== 0) 
                {setMeetingTypeClickSuccess(true);}
                else{setMeetingTypeClickSuccess(false);}
                
            })
            .catch(error => {
                console.error('Error fetching meetings:', error);
            });
    };

    const updateMeetingOptions = (meetings,contactId) => {
        return (
            <ul id="contact-meeting-list" style={{ maxHeight: '100%', overflowY: 'auto', display: isMeetingTypeClickSuccess ? 'block' : 'none' }}>
                {meetings.map(meeting => (
                    <li key={meeting.id}>
                        <a href="#" onClick={() => handleMeetingClick(contactId,meeting.id)} 
                        className={`contact-a ${meeting.id === activeMeetingId ? 'active' : ''}`}
                        >{meeting.title}</a>
                    </li>
                ))}
            </ul>
        );
    };

    const handleMeetingClick = (contactId,meetingId) => {
        setActiveMeetingId(meetingId);
        setMeetingDetails(null);
        fetch(`http://localhost:8000/contacts/${contactId}/meetings/detail/${meetingId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(meeting => {
            setMeetingDetails(meeting);
        })
        .catch(error => {
            console.error('Error fetching meeting details:', error);
        });
};

const handleDeleteMeeting = (contactId, meetingId, meetingTitle) => {
    const confirmation = window.confirm(`Are you sure you want to cancel the meeting: ${meetingTitle}?`);
    if (confirmation) {
        fetch(`http://localhost:8000/contacts/${contactId}/meetings/detail/${meetingId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Meeting deleted successfully
                onDeleteMeeting(meetingId);
            } else {
                // Error deleting meeting
                console.error('Error deleting meeting:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting meeting:', error);
        });
    }
};

const onDeleteMeeting = (meetingId) => {
    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
    setMeetingDetails(null);
    console.log(meetings);
    console.log(meetings.length);
    if (meetings.length===1){
        setMeetingTypeClickSuccess(false);
    }
};

const handleSelectedSlotChange = (slot) => {
    setSelectedSlot(slot);
    console.log(selectedSlot);
};


function convertToUTCTime(localDate, localTime){
  let dateTimeString = `${localDate}T${localTime}`;
  let localDateTimeObj = new Date(dateTimeString);
  let utcString = localDateTimeObj.toLocaleString('en-US', { timeZone: 'UTC' });
  return utcString;
}

function combineDateTime(dateTimeString) {
  const dateTimeObj = new Date(dateTimeString);
  const year = dateTimeObj.getFullYear();
  const month = String(dateTimeObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateTimeObj.getDate()).padStart(2, '0');
  const hours = String(dateTimeObj.getHours()).padStart(2, '0');
  const minutes = String(dateTimeObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateTimeObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

const handleConfirmMeeting = (contactId, meetingId, meetingTitle) => {
    console.log(selectedSlot);
    const confirmation = window.confirm(`Confirm ${meetingTitle} at ${selectedSlot.date}, ${selectedSlot.start_time}`);
 
    
    if (confirmation) {
        // const formattedDate = new Date(selectedSlot.date).toISOString();
         const formattedStartTime = convertToUTCTime(selectedSlot.date, selectedSlot.start_time);
         const utcDateTime = combineDateTime(formattedStartTime)


        fetch(`http://localhost:8000/contacts/${contactId}/meetings/detail/${meetingId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            selected_time: utcDateTime,
        }),
        })
        .then(response => {
            if (response.ok) {
                console.log(formattedStartTime);
                onDeleteMeeting(meetingId);
                setSelectedSlot(prevState => ({
                ...prevState,
                availability_level: 'none'
                }));
        
            } else {
                console.error('Failed to update selected time');
            }
        })
        .catch(error => {
            console.error('Error update meeting:', error);
        }); 

         fetch(`http://localhost:8000/availability/availability-list/`, {
                method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedSlot, 
        }),

         })
          .then(response => {
            if (response.ok) {
                console.log('Successfully deleted the selected time in user availability');
            } else {
                console.error('Failed to deleted the selected time in user availability');
            }
        })
        .catch(error => {
            console.error('Error delete user availability:', error);
        }); 
        
        
    }
};


const handleDeleteContact = (contact) => {
     const confirmation = window.confirm(`Confirm delete contact ${contact.first_name} ${contact.last_name}`);
     if(confirmation) {
        fetch(`http://localhost:8000/contacts/${contact.id}/`, {
         method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Meeting deleted successfully
                onDeleteContact(contact.id);
            } else {
                // Error deleting meeting
                console.error('Error deleting contact:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting contact', error);
        });
    }

};

const onDeleteContact = (contactId) => {
    setContacts(prevContacts => prevContacts.filter(contacts => contacts.id !== contactId));
    setContactDetails(null);
    setMeetingTypeClickSuccess(false);
};

const handleSendReminder = (contactId, meetingId, meetingTitle) => {
    fetch(`http://localhost:8000/contacts/${contactId}/meetings/detail/${meetingId}/send-reminder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
        if (response.ok) {
            return response.json(); // Parse the JSON response
        } else {
            throw new Error('Failed to send reminder'); 
        }
        })
        .then(data => {
            console.log('Reminder email sent:', data.message);
            alert('Reminder email sent successfully');
        })
        .catch(error => {
            console.error('Error send reminder:', error);
        });

}

useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


const handleMeetingClickResponsive = () => {
    const meetingList = document.getElementById('contact-meeting-list');
    const meetingDetails = document.getElementById('contact-meeting-details');
    if (isSmallScreen) {
    meetingList.style.display = 'none';
    if (meetingDetails) {
      meetingDetails.style.display = 'block';
    }
  }
};


  const handleSidebarClick = (event) => {
    const sidebar = document.getElementById('contact-sidebar');
    const meetinglist = document.getElementById('contact-meeting-list');
    if (event.target.matches('#contact-meeting-list li a') && isSmallScreen) {
      document.getElementById('contact-meeting-list').classList.add('hide-meeting-list');
      handleMeetingClickResponsive();
    }
    if (event.target.matches('#contactList li a') && isSmallScreen) {
      sidebar.style.display = 'none';
    }
    if (event.target.matches('#contact-meeting-type li a') && isSmallScreen) {
      meetinglist.style.display = 'block';
    }
  };


    useEffect(() => {
    document.addEventListener('click', handleSidebarClick);
    return () => {
      document.removeEventListener('click', handleSidebarClick);
    };
  }, [isSmallScreen]);


function toggleContactSidebar() {
  var sidebar = document.getElementById('contact-sidebar');
  if (sidebar.style.display === 'none' || sidebar.style.display === '') {
    sidebar.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
  }
}

    return (
        
        <div className='contact-body'>
            <div className='contact-header'>
         <ToggleContact />
         </div>
        <div id="contact-main-content">
            <div className="contact-sidebar" id="contact-sidebar">
                <div className="contact-icon-container">
                    <Link to="/add-contact">
                        <img
                            src={addContactImage}
                            alt="Add Icon"
                            id="add-icon"
                        />
                    </Link>
                </div>
                <h2>Contact List</h2>
                <input
                    className="contact-input"
                    type="text"
                    value={filter}
                    placeholder="Search contacts"
                    onChange={(e) => setFilter(e.target.value)}
                />
                <ul id="contactList" style={{ maxHeight: '70%', overflowY: 'auto' }}>
                    {contacts.map(contact => (
                        <li key={contact.id}>
                            <a 
                                href="#"
                                onClick={() => handleContactClick(contact.id)}
                                className={`contact-a ${contact.id === activeContact ? 'active' : ''}`}
                            >
                                {contact.first_name} {contact.last_name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div id="contact-details">
                   {!contactDetails && (
                    <div className="contact-img-container">
                        <img
                            src={contactBookImage}
                            alt="contactbook"
                        />
                        <h2>
                            View contact info and meeting details by clicking a contact in the
                            left panel.
                        </h2>
                    </div>
                )}
                {contactDetails && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2>{contactDetails.first_name} {contactDetails.last_name}</h2>
                        <div className="contact-icon-container">
                        <Link to={`/edit-contact/${contactDetails.id}`}>
                         <img
                            src={editContactImage}
                            alt="edit Icon"
                            id="edit-icon"
                        />
                        </Link>
                        <img
                            src={deleteContactImage}
                            alt="delete Icon"
                            id="delete-icon"
                             onClick={() => handleDeleteContact(contactDetails)}
                        />
                        </div>

                        </div>
                        <p>Email: {contactDetails.email}</p>
                        <div id="contact-options">
                            <div id="contact-status-sidebar">
                                <ul id="contact-meeting-type">
                                    {['Unconfirmed', 'Scheduling', 'Confirmed'].map(option => (
                                        <li key={option}>
                                            <a
                                                href="#"
                                                className={`contact-a ${option === activeOption ? 'active' : ''}`}
                                                onClick={() => handleMeetingTypeClick(contactDetails.id,option)}
                                            >
                                                {option}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div id="contact-meeting-options">
                                {updateMeetingOptions(meetings,contactDetails.id)}
                                {meetingDetails&&(
                                    <div id="contact-meeting-details">
                                        <h3>{meetingDetails.title}</h3>
                                        <p>Content: {meetingDetails.content}</p>
                                        <p>Duration: {meetingDetails.duration}</p>
                                        <p>Location: {meetingDetails.location}</p>
                                        {meetingDetails.meeting_status === "Unconfirmed" && (
                                            <span>
                                                <p>Deadline:{new Date(meetingDetails.deadline).toLocaleString('en-US', {
                                                                                        weekday: 'long', // "Monday"
                                                                                        year: 'numeric', // "2024"
                                                                                        month: 'long', // "March"
                                                                                        day: 'numeric', // "12"
                                                                                        hour: '2-digit', // "01"
                                                                                        minute: '2-digit', // "30"
                                                                                        second: '2-digit', // "00"
                                                                                        timeZoneName: 'short' // "GMT"
                                                                                    })}
                                                    
                                                    </p>
                                                <p>Suggested time: Waiting for {contactDetails.first_name} {contactDetails.last_name} to confirm.</p>
                                                <div className="contact-buttons-container">
                                                    <button id="contact-meeting-button"
                                                    onClick={() => handleDeleteMeeting(contactDetails.id,meetingDetails.id,meetingDetails.title)}
                                                    >Cancel Meeting</button>
                                                    <button id="contact-meeting-button"
                                                    onClick={() => handleSendReminder(contactDetails.id,meetingDetails.id,meetingDetails.title)}
                                                    >Send Reminder</button>
                                                </div>


                                            </span>
                                        )}
                                        {meetingDetails.meeting_status === "Scheduling" && (
                                            <div>
                                                <p>Suggested time:</p>
                                              
                                                    <SuggestedTime meetingId={meetingDetails.id} meetingInfo={meetingDetails} 
                                                     onSelectedSlotChange={handleSelectedSlotChange}/>
                                                   
                                               
                                             
                                                <div className="contact-buttons-container">
                                                    <button id="contact-meeting-button"
                                                    onClick={() => handleDeleteMeeting(contactDetails.id,meetingDetails.id,meetingDetails.title)}
                                                    >Cancel Meeting</button>
                                                    <button id="contact-meeting-button"
                                                    onClick={() => handleConfirmMeeting(contactDetails.id,meetingDetails.id,meetingDetails.title)}>
                                                        Confirm Meeting</button>
                                                </div>
                                            </div>
                                        )}
                                        {meetingDetails.meeting_status === "Confirmed" && (
                                        <div>
                                            <p>Time:

                                                {new Date(meetingDetails.scheduled_time).toLocaleString('en-US', {
                                                                                        weekday: 'long', // "Monday"
                                                                                        year: 'numeric', // "2024"
                                                                                        month: 'long', // "March"
                                                                                        day: 'numeric', // "12"
                                                                                        hour: '2-digit', // "01"
                                                                                        minute: '2-digit', // "30"
                                                                                        second: '2-digit', // "00"
                                                                                        timeZoneName: 'short' // "GMT"
                                                                                    })}
                                                </p>
                                            <div className="contact-buttons-container">
                                                <button id="contact-meeting-button"
                                                onClick={() => handleDeleteMeeting(contactDetails.id,meetingDetails.id, meetingDetails.title)}
                                                >Cancel Meeting</button>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
        
    );


}
export default ContactList;