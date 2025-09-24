//hide or show location or remote link based on modality selection
function updateLocationOptions(modality) {
    const locationInput = document.getElementById("event_location").closest(".mb-3");
    const remoteInput = document.getElementById("event_remote_url").closest(".mb-3");
    const locationField = document.getElementById("event_location");
    const remoteField = document.getElementById("event_remote_url");

    if (modality === "In-person") {
        locationInput.style.display = "block";
        remoteInput.style.display = "none";
        locationField.required = true;
        remoteField.required = false;
    } else if (modality === "Remote") {
        locationInput.style.display = "none";
        remoteInput.style.display = "block";
        locationField.required = false;
        remoteField.required = true;
    } else {
        locationInput.style.display = "none";
        remoteInput.style.display = "none";
        locationField.required = false;
        remoteField.required = false;
    }
}

//load the correct fields on page load
document.addEventListener("DOMContentLoaded", function() {
    updateLocationOptions(document.getElementById("event_modality").value);

    const form = document.querySelector("#event_modal form.needs-validation");
    const saveBtn = document.querySelector("#event_modal .btn-primary");
    saveBtn.addEventListener("click", function () {
        //remove previous validation state
        form.classList.remove("was-validated");
        if (!form.checkValidity()) {
            form.classList.add("was-validated"); //show Bootstrap validation
            return;
        }
        //save event if valid
        saveEvent();
    });

    //reset form and validation state when modal closes
    const eventModal = document.getElementById("event_modal");
    eventModal.addEventListener('hidden.bs.modal', function () {
        form.reset();
        form.classList.remove("was-validated");
        updateLocationOptions(""); //hide location/remote fields
    });
});

const events = []; //array to hold events
let editingEventIndex = null; //track which event is being edited
let editingEventCard = null;   //reference to the DOM card being edited

function saveEvent() {
    const name = document.getElementById("event_name").value.trim();
    const category = document.getElementById("event_category").value;
    const weekday = document.getElementById("event_weekday").value;
    const time = document.getElementById("event_time").value;
    const modality = document.getElementById("event_modality").value;
    const location = document.getElementById("event_location").value.trim();
    const remote_url = document.getElementById("event_remote_url").value.trim();
    const attendees = document.getElementById("event_attendees").value.split(',').map(att => att.trim()).filter(att => att);

    const eventDetails = {
        name: name,
        category: category,
        weekday: weekday,
        time: time,
        modality: modality,
        location: modality === "In-person" ? location : null,
        remote_url: modality === "Remote" ? remote_url : null,
        attendees: attendees
    };

    if (editingEventIndex !== null) {
        //update existing
        events[editingEventIndex] = eventDetails;
        console.log("Event updated:", eventDetails);
        console.log("All events:", events);
        editingEventCard.style.backgroundColor = eventCategoryColor(eventDetails.category);
        editingEventCard.querySelector(".col-12").innerHTML = buildEventInfo(eventDetails);
        //move card if weekday changed
        let newWeekdaySection = document.getElementById(eventDetails.weekday.toLowerCase());
        if (newWeekdaySection && editingEventCard.parentElement !== newWeekdaySection) {
            newWeekdaySection.appendChild(editingEventCard);
        }
    } else {
        //add new event to array
        events.push(eventDetails);
        console.log("Event saved:", eventDetails);
        console.log("All events:", events);
        addEventToCalendarUI(eventDetails);
    }
    
    editingEventIndex = null; //reset after saving
    editingEventCard = null;
    
    //close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("event_modal"));
    modal.hide();
}

function addEventToCalendarUI(eventInfo) {
    let index = events.indexOf(eventInfo); //get index of newly added event
    let event_card = createEventCard(eventInfo, index);
    let weekday_section = document.getElementById(eventInfo.weekday.toLowerCase());
    if (weekday_section) {
        weekday_section.appendChild(event_card);
    } else {
        console.error("Invalid weekday:", eventInfo.weekday);
    }
}

function createEventCard(eventDetails, index) {
    let event_element = document.createElement('div');
    event_element.classList = 'event row border rounded m-1 py-1';
    event_element.style.backgroundColor = eventCategoryColor(eventDetails.category);

    let info = document.createElement('div');
    info.classList = "col-12";
    info.innerHTML = buildEventInfo(eventDetails);
    event_element.appendChild(info);

    //add click listener to open edit modal
    event_element.addEventListener("click", () => {
        editingEventIndex = index;     //remember which one we clicked
        editingEventCard = event_element; //remember the DOM card
        openEditModal(events[index]);   //load values into modal
    });

    return event_element;
}

//build event info HTML for display
function buildEventInfo(eventDetails) {
    //build the display content conditionally
    return `
        ${eventDetails.name ? `<strong>Event Name:</strong> ${eventDetails.name}<br>` : ""}
        ${eventDetails.category ? `<strong>Category:</strong> ${eventDetails.category}<br>` : ""}
        ${eventDetails.time ? `<strong>Time:</strong> ${eventDetails.time}<br>` : ""}
        ${eventDetails.modality ? `<strong>Modality:</strong> ${eventDetails.modality}<br>` : ""}
        ${(eventDetails.modality === 'In-person' && eventDetails.location) 
            ? `<strong>Location:</strong> ${eventDetails.location}<br>` 
            : ""}
        ${(eventDetails.modality === 'Remote' && eventDetails.remote_url) 
            ? `<strong>Meeting URL:</strong> <a href="${eventDetails.remote_url}" target="_blank">${eventDetails.remote_url}</a><br>` 
            : ""}
        ${eventDetails.attendees?.length 
            ? `<strong>Attendees:</strong> ${eventDetails.attendees.join(", ")}<br>` 
            : ""}
    `;
}

//open modal with pre-filled values
function openEditModal(eventDetails) {
    document.getElementById("event_name").value = eventDetails.name || "";
    document.getElementById("event_category").value = eventDetails.category || "";
    document.getElementById("event_time").value = eventDetails.time || "";
    document.getElementById("event_modality").value = eventDetails.modality || "";
    document.getElementById("event_location").value = eventDetails.location || "";
    document.getElementById("event_remote_url").value = eventDetails.remote_url || "";
    document.getElementById("event_attendees").value = eventDetails.attendees?.join(", ") || "";

    //update display of location/remote fields based on modality
    updateLocationOptions(eventDetails.modality);

    //show modal
    const modal = new bootstrap.Modal(document.getElementById("event_modal"));
    modal.show();
}


function eventCategoryColor(category) {
    if (category === "Academic") {
        return "rgba(182, 217, 255, 1)";
    } else if (category === "Work") {
        return "rgba(255, 197, 143, 1)";
    } else if (category === "Personal") {
        return "rgba(255, 195, 233, 1)";
    } else if (category === "Travel") {
        return "rgba(255, 253, 181, 1)";
    } else if (category === "Holiday") {
        return "rgba(240, 184, 255, 1)";
    } else {
        return "light gray"; //default color
    }
}