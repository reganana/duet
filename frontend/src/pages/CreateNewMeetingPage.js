import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/CreateNewMeetingPage.css';
import HeaderNoToggle from "../components/Header/NoToggle.js";
import { Link } from 'react-router-dom';
function CreateNewMeetingPage() {
  const navigate = useNavigate();
  const [meetingInfo, setMeetingInfo] = useState({
    title : '',
    duration: '',
    deadline: '',
    location: '',
    content: '',
    contact: '',
    preferred_user: false,
  });

  //handle display contacts
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  //filter the contact list
  const [attendeeInput, setAttendeeInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem('accessToken');
      // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzEyMzM1MjczLCJpYXQiOjE3MTIzMzE2NzMsImp0aSI6ImUwYzI1M2Y5YjYxYTRlNDFiNjMxYTI3MDgwOGU5N2M0IiwidXNlcl9pZCI6MX0.H_PWrD_VdsyHc7uAAVcvvu_BELNUwzgOIltycmMA7uY';
      const response = await fetch('http://localhost:8000/contacts/', {
        method: 'GET',   
        headers: {
            'Authorization': `Bearer ${token}`,
          },
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        // Handle error
        console.error('Failed to fetch contacts');
      }
    };

    fetchContacts();
  }, []);

  // const [contacts, setContacts] = useState([
  //   //example data
  //   { id: 1, first_name: "Alice", last_name: "Johnson" },
  //   { id: 2, first_name: "Bob", last_name: "Smith" },
  //   { id: 3, first_name: "Abb", last_name: "Johnson" },
  // ]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: "",
    }));

    if (name === "timeSlot") {
      setMeetingInfo(prevState => ({
        ...prevState,
        preferred_user: value === 'prefered_time',
      }));
    }else if(name === "contact"){
        setAttendeeInput(value);
        setShowContacts(true);
    }else{
      setMeetingInfo(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.error('Invalid form');
      return;
    }

    const endpoint = 'http://localhost:8000/meeting/';

    try {
      const userToken = localStorage.getItem('accessToken');
      // const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzEyMzM1MjczLCJpYXQiOjE3MTIzMzE2NzMsImp0aSI6ImUwYzI1M2Y5YjYxYTRlNDFiNjMxYTI3MDgwOGU5N2M0IiwidXNlcl9pZCI6MX0.H_PWrD_VdsyHc7uAAVcvvu_BELNUwzgOIltycmMA7uY';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(meetingInfo),
      });

      // console.log(meetingInfo);
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        alert("Meeting submitted successfully!");

        // Reset the form and any other relevant state
        setMeetingInfo({
          title : '',
          contact: '',
          duration: '',
          deadline: '',
          location: '',
          content: '',
          preferred_user: false,
        });
        setAttendeeInput('');
        setShowContacts(false);
        navigate('/');
      } else {
        const error = await response.json();
        console.error('Submission failed', error);
        alert("Meeting submission failed. Please try again.");
      }
    }catch (error) {
      console.error('There is an error', error);
    }
  };

  const handleSelectContact = (contact) => {
    setAttendeeInput(`${contact.first_name} ${contact.last_name}`);
    setShowContacts(false);
    console.log("in");
    console.log(contact.id);
    setMeetingInfo(prevState => ({
      ...prevState,
      contact: `${contact.id}`,
    }));

    console.log(meetingInfo);
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(attendeeInput.toLowerCase())
  );

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    console.log(isValid);

    if (!meetingInfo.title) {
      errors.title = 'Meeting title is required';
      console.log(errors.title);
      isValid = false;
    }

    if (!meetingInfo.contact) {
      errors.contact = 'Attendee is invalid';
      console.log(errors.title);
      isValid = false;
    }

    if (!meetingInfo.duration) {
      errors.duration = 'Meeting duration is required';
      console.log(errors.title);
      isValid = false;
    }

    if (!meetingInfo.deadline) {
      errors.deadline = 'Deadline is required';
      console.log(errors.title);
      isValid = false;
    }

    if (!meetingInfo.location) {
      errors.location = 'Location is required';
      console.log(errors.title);
      isValid = false;
    }

    if (!meetingInfo.content) {
      errors.content = 'Meeting content is required';
      console.log(errors.title);
      isValid = false;
    }

    if (meetingInfo.preferred_user == null) {
      errors.preferred_user = 'Preferred timeslot is required';
      console.log(errors.title);
      isValid = false;
    }

    setValidationErrors(errors);

    console.log(isValid);

    return isValid;
  };

    return (
      <div>
        <HeaderNoToggle />
        <div className = "NewMeetingMain">
          <div className="NewMeetingcontainer">
            <form className="meeting-form" onSubmit={handleSubmit}>
              <h2>Create New Meeting</h2>

              <div className="new-meeting-form-group">
                <Link to ="/Availability"> Set/Modify your availability </Link>
              </div>

              <div className="new-meeting-form-group">
                <label htmlFor="title">Meeting title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={meetingInfo.title}
                  onChange={handleChange}
                />
                {validationErrors.title && <p className="NewMeetingError">{validationErrors.title}</p>}
              </div>

              {/* <div className="new-meeting-form-group">
                <label htmlFor="attendee">Attendee:</label>
                <input
                  type="email"
                  id="attendee"
                  name="attendee"
                  value={meetingInfo.attendee}
                  onChange={handleChange}
                  multiple
                />
              </div> */}

              <div className="new-meeting-form-group">
                <label htmlFor="contact">Attendee:</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={attendeeInput}
                  onChange={handleChange}
                />
                {showContacts && attendeeInput && (
                  <ul>
                    {filteredContacts.map(contact => (
                      <li className = "newMeetingContacts" key={contact.id} onClick={() => handleSelectContact(contact)}>
                        {contact.first_name} {contact.last_name}
                      </li>
                    ))}
                  </ul>
                )}
                {validationErrors.contact && <p className="NewMeetingError">{validationErrors.contact}</p>}
              </div>

              <div className="new-meeting-form-group">
                <label htmlFor="duration">Duration:</label>
                <select
                  id="duration"
                  name="duration"
                  value={meetingInfo.duration}
                  onChange={handleChange}
                >
                  <option value="">Select Duration</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours 30 minutes</option>
                  <option value="150">3 hours</option>
                  <option value="180">3 hours 30 minutes</option>
                  <option value="210">4 hours</option>
                </select>
                {validationErrors.duration && <p className="NewMeetingError">{validationErrors.duration}</p>}
              </div>

              <div className="new-meeting-form-group">
                <label htmlFor="Deadline">Deadline for attendee to reply:</label>
                <input
                  type="datetime-local"
                  id="Deadline"
                  name="deadline"
                  value={meetingInfo.deadline}
                  onChange={handleChange}
                />
                {validationErrors.deadline && <p className="NewMeetingError">{validationErrors.deadline}</p>}
              </div>

              <div className="new-meeting-form-group">
                <label htmlFor="location">Location:</label>
                <textarea
                  id="location"
                  name="location"
                  value={meetingInfo.location}
                  onChange={handleChange}
                />
                {validationErrors.location && <p className="NewMeetingError">{validationErrors.location}</p>}
              </div>

              <div className="new-meeting-form-group">
                <label htmlFor="content">Meeting Content:</label>
                <textarea
                  id="content"
                  name="content"
                  value={meetingInfo.content}
                  onChange={handleChange}
                />
                {validationErrors.content && <p className="NewMeetingError">{validationErrors.content}</p>}
              </div>

              <div className="new_meeting_choose_button">
                <label>Timeslots for attendee to select:</label><br />
                <input
                  type="radio"
                  id="all_free"
                  name="timeSlot"
                  value="all_free"
                  checked={!meetingInfo.preferred_user}
                  onChange={handleChange}
                />
                <label htmlFor="all_free">All free timeslots</label><br />
                <input
                  type="radio"
                  id="prefered_time"
                  name="timeSlot"
                  value="prefered_time"
                  checked={meetingInfo.preferred_user}
                  onChange={handleChange}
                />
                <label htmlFor="prefered_time">Preferred timeslots</label>
              </div>
              
              <div className="new-meeting-form-group">
                <button type="submit">Create Meeting</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  export default CreateNewMeetingPage;
  