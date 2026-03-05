
function showContact(contactId) {

    fetch(`/get_contacts/${contactId}/`)
        .then(response => response.json())
        .then(contact => {
        var contactDetails = document.getElementById('contact-details');
        contactDetails.innerHTML = '<h2>' + contact.first_name +  ' ' + contact.last_name + '</h2>'+   '<p>Email: ' + contact.email + '</p>';
    });
    var optionsFrame = document.createElement('div');
    optionsFrame.id = 'contact-options';
    var statusSidebar = document.createElement('div');
    statusSidebar.id = 'status-sidebar';

    var optionsList = document.createElement('ul');
    optionsList.id='meeting-type';
    var options = ['Unconfirmed', 'Scheduling', 'Confirmed'];
    options.forEach(function (option) {
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#';
        link.textContent = option;
        link.addEventListener('click', function () {
           var allLinks = optionsList.getElementsByTagName('a');
        for (var i = 0; i < allLinks.length; i++) {
            allLinks[i].classList.remove('active');
        }
        link.classList.add('active');
             var meetingOptionsContainer = document.getElementById('contact-options');
             fetch(`/get_contacts/${contactId}/${option.toLowerCase()}/`)
                        .then(response => response.json())
                        .then(data => {
                            updateMeetingOptions(data.meetings, meetingOptionsContainer, option);
                        });
        });
        listItem.appendChild(link);
        optionsList.appendChild(listItem);
    });

    statusSidebar.appendChild(optionsList);
    optionsFrame.appendChild(statusSidebar);
    contactDetails.appendChild(optionsFrame);
   
}
function updateMeetingOptions(meetings,container,option) {
 if (!container) {
        console.error("Container element is undefined. Unable to update meeting options.");
        return;
    }

    // Check if the 'meeting-options' div already exists
    var meetingOptions = container.querySelector('#meeting-options');
    
    // If it doesn't exist, create it
    if (!meetingOptions) {
        meetingOptions = document.createElement('div');
        meetingOptions.id = 'meeting-options';
        container.appendChild(meetingOptions);
    }

    // Clear the existing content of the container
    meetingOptions.innerHTML = '';

    // Create an unordered list for meeting list
  var meetingList = document.createElement('ul');
  meetingList.id = 'meeting-list';

  meetings.forEach(function (meeting) {
    var listItem = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = meeting.title;

    listItem.appendChild(link);
    meetingList.appendChild(listItem);
  });

    meetingList.addEventListener('click', function (event) {
    // Check if the clicked element is a link within the meeting list
    if (event.target.tagName === 'A') {
      var clickedMeeting = meetings.find(meeting => meeting.title === event.target.textContent);

      if (clickedMeeting) {
         var allLinks = meetingList.getElementsByTagName('a');
            for (var i = 0; i < allLinks.length; i++) {
                allLinks[i].classList.remove('active');
            }
            event.target.classList.add('active');
        showMeetingDetails(clickedMeeting.id,clickedMeeting.title, clickedMeeting.content, clickedMeeting.deadline, option,clickedMeeting.duration, clickedMeeting.location);
      }
    }
  });

  meetingOptions.appendChild(meetingList);

 
}
function showMeetingDetails(id,title, content, deadline,option,duration,location) {
    var meetingDetailsContainer = document.getElementById('meeting-options');
    
    // Create a div to hold the meeting details
    var meetingDetailsElement = document.createElement('div');
    meetingDetailsElement.id = 'meeting-details';
    
    // Update the meeting details in the created div
    meetingDetailsElement.innerHTML = '<h3>' + title + '</h3>' +
                                      '<p>Content: ' + content + '</p>' +
                                      '<p>Location: ' + location + '</p>'+ '<p>Duration:' +duration+ '</p>';

    if(option=="Unconfirmed"){
         meetingDetailsElement.innerHTML +='<p>Deadline:' + deadline + '</p>'; 
         meetingDetailsElement.innerHTML +='<p>Suggested time: none'+'</p>'; 
         
        meetingDetailsElement.innerHTML+=`<div class="buttons-container">
        <button id="meeting-button" class="cancel-meeting-button">Cancel Meeting</button>
        <button id="meeting-button" class="send-reminder">Send Reminder</button>
        </div>`;  
        var cancelMeetingButton = document.getElementsByClassName('cancel-meeting-button');
        cancelMeetingButton.addEventListener('click', function () {
        var confirmation = window.confirm("Are you sure you want to cancel the meeting?");
        if (confirmation) {
            // Code to handle meeting cancellation
            cancelMeetingButton(id);
        }
        });     
        
    }
    else if(option=="Scheduling"){
         meetingDetailsElement.innerHTML +='<p>Suggested time:'+'</p>';  
    meetingDetailsElement.innerHTML+=`<div class="suggested-time-buttons-container">
        <button id="suggested-time-button">12:00</button>
        <button id="suggested-time-button">13:00</button>
        <button id="suggested-time-button">14:00</button>
        <button id="suggested-time-button"><a href="../Schedule_meeting_page/schedule_meeting.html">More time</a></button>
        </div>`;       

    meetingDetailsElement.innerHTML+=`<div class="buttons-container">
        <button id="meeting-button">Cancel Meeting</button>
        <button id="meeting-button">Confirm Meeting</button>
        </div>`;      
    }
    else if(option=="Confirmed"){
         meetingDetailsElement.innerHTML +='<p>Time: 12:00pm'+'</p>';  
        meetingDetailsElement.innerHTML+=`<div class="buttons-container">
        <button id="meeting-button">Cancel Meeting</button>
        </div>`;       

    }
    else{

    }

    // Clear existing meeting details
    var existingMeetingDetails = meetingDetailsContainer.querySelector('#meeting-details');
    if (existingMeetingDetails) {
        meetingDetailsContainer.removeChild(existingMeetingDetails);
    }

    // Append the created div to the container
    meetingDetailsContainer.appendChild(meetingDetailsElement);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function cancelMeeting(meetingId) {
    fetch(`/cancel_meeting/${meetingId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') 
        },
    })
    .then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Failed to delete meeting. Please try again.');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateContactList() {
    var contactList = document.getElementById('contactList');
    contactList.innerHTML = ''; // Clear existing list items

     fetch('/get_contacts/')
        .then(response => response.json())
        .then(data => {
            data.forEach(function (contact) {
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#';
        link.textContent = contact.first_name + ' ' + contact.last_name;
        listItem.onclick = function () {
          var allLinks = contactList.getElementsByTagName('a');
            for (var i = 0; i < allLinks.length; i++) {
                allLinks[i].classList.remove('active');
            }

            link.classList.add('active');
            showContact(contact.id);
        };
        listItem.appendChild(link);
        contactList.appendChild(listItem);
      });
    });
}


function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  if (sidebar.style.display === 'none' || sidebar.style.display === '') {
    sidebar.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
  }
}

function isSmallScreen() {
  return window.innerWidth < 640;
}






// Function to handle meeting click
function handleMeetingClick() {
  var meetingList = document.getElementById('meeting-list');
  var meetingDetails = document.getElementById('meeting-details');
  if (isSmallScreen()) {
    meetingList.style.display = 'none';
    meetingDetails.style.display = 'block';
  }
}



document.addEventListener('click', function(event) {
  if (event.target.matches('#meeting-list li a')) {
    if (window.innerWidth < 640) {
      document.getElementById('meeting-list').classList.add('hide-meeting-list');
    }
    handleMeetingClick();
  }
});

document.addEventListener('click', function(event) {
var sidebar = document.getElementById('sidebar');
  if (event.target.matches('#contactList li a')) {
    if (window.innerWidth < 640) {
      sidebar.style.display = 'none';
    }
  }
});




updateContactList();