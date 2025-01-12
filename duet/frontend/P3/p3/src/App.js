// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateNewMeetingPage from './pages/CreateNewMeetingPage';
import AttendeeLinkPage from './pages/AttendeeLinkPage';
import ScheduleMeetingPage from './pages/ScheduleMeetingPage';
import Calendar from './pages/CalendarPage';
import SendPwdRequestPage from './pages/SendPwdRequestPage';
import ResetPwdPage from './pages/ResetPwdPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserAvailabilityPage from './pages/UserAvailabilityPage';
import ContactList from './pages/Contact'
import AddContact from './pages/AddContact';
import EditContact from './pages/EditContact';
import AttendeeAvailabilityPage from './pages/AttendeeAvailabilityPage';
import ProtectedRoute from './components/ProtectedRoute';
import ContactAvailabilityPage from './pages/ContactAvailabilityPage';


function App() {
  return (
    <Router>
      {/* Navigation Links */}
        {/* TODO: Add navigation/header here */}
      
      {/* Routes */}
      <Routes>
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/ResetPwdRequest" element={<SendPwdRequestPage />} />
        <Route path="/ResetPwd" element={<ResetPwdPage />} />
        <Route path="/AttendeeLinkPage/:meetingId" element={<AttendeeLinkPage />} />
        <Route path="/ContactAvailability/:meetingId" element={<AttendeeAvailabilityPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/CreateNewMeetingPage" element={<CreateNewMeetingPage />} />
          <Route path="/ScheduleMeetingPage/:meetingId" element={<ScheduleMeetingPage />} />
          <Route path="/" element={<Calendar />} />
          <Route path="/Availability" element={<UserAvailabilityPage />} />
          <Route path="/contact" element={<ContactList />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/edit-contact/:contactId" element={<EditContact />} />
          <Route path="/View-Contact-Availability/:meetingId" element={<ContactAvailabilityPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

