let contacts = [];
let newContact = [];
let tasks = [];
let previouslySelectedContact = null;
let currentFormId;


/**
 * Loading the contacts from the server
 * @param {Array} contacts
 */
async function initContact() {
    currentSection = "contact-page";
    await includeHTML();
    await downloadFromServer();
    contacts = JSON.parse(backend.getItem('contacts')) || [];
    loadContacts();
    setCurrentSectionStyle();
}


/**
 * Add contacts to array
 * Reload the contact list
 * Reset the input fields
 * @param {String} newContact
 */
function addContacts() {
    let id;
    let firstName = document.getElementById('firstName').value;
    let lastName = document.getElementById('lastName').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;
    let color = document.getElementById('color').value;
    createContactCard(id, firstName, lastName, email, phone, color);
    newContact.id = contacts.length;
    contacts.push(newContact);
    backend.setItem('contacts', JSON.stringify(contacts));
    popupSuccess();
    updateContactList();
    resetInputFields();
    closeAddContactForm();
}


/**
 * Shows a popup message indicating that a contact has been successfully created.
 */
function popupSuccess() {
    let popup = document.createElement('div');
    addClass(popup, 'popup-contact-added');
    popup.innerHTML = `<p>contact successfully created</p>`;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}


/**
 * Create contact card
 * @param {*} id - The unique identifier for the contact 
 * @param {*} firstName - The first name of the contact. 
 * @param {*} lastName - The last name of the contact. 
 * @param {*} email - The email address of the contact.
 * @param {*} phone - The phone number of the contact. 
 * @param {*} color - The color associated with the contact. 
 */
function createContactCard(id, firstName, lastName, email, phone, color) {
    newContact = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        color: color
    };
}


/**
 * Load contacts from array and sort them by first letter
 * Array of unique first letters
 * Sorts the array alphabetically
 */
function loadContacts() {
    let firstLetters = [];
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        let firstLetter = contact.lastName.charAt(0).toLowerCase();
        if (!firstLetters.includes(firstLetter)) {
            firstLetters.push(firstLetter);
        }
    }
    firstLetters.sort();
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    showContactList(contactList, firstLetters);
}


/**
 * Creates the contact list
 * @param {*} contactList - The DOM element where the contact list will be  
 * @param {*} firstLetters - An array of first letters of all last names in the contact list 
 */
function showContactList(contactList, firstLetters) {
    for (let i = 0; i < firstLetters.length; i++) {
        const firstLetter = firstLetters[i];
        contactList.innerHTML += showContactFirstLettersHTML(firstLetter);

        for (let j = 0; j < contacts.length; j++) {
            const contact = contacts[j];
            let contactFirstLetter = contact.lastName.charAt(0).toLowerCase();
            if (contactFirstLetter === firstLetter) {
                contactList.innerHTML += generateContactList(contact, j);
            }
        }
    }
}


/**
 * Show contact details
 * @param {*} i - The index of the selected contact in the contacts array 
 */
function showContactDetails(i) {
    const contactSelection = document.getElementById('contactSelection');
    const contactOverlay = document.getElementById('contactOverlay');
    contactSelection.innerHTML = '';
    let selectedContact = contacts[i];
    let userShort = selectedContact['firstName'].charAt(0).toLowerCase() + selectedContact['lastName'].charAt(0).toLowerCase()
    contactSelection.innerHTML += showContactDetailsHTML(selectedContact, i, userShort);
    addClass(contactOverlay, 'show-contact-selection-overlay');

    if (window.innerWidth < 1000) {
        addBodyOverflow();
    }
}


/**
 * Highlights a selected contact by giving it a different color.
 * @param {*} i - The index of the contact to highlight. 
 */
function hightlightContact(i) {
    let currentHighlightContact = document.getElementById('highlight-' + i);
    addClass(currentHighlightContact, 'selected-contact-box');

    if (previouslySelectedContact !== null) {
        removeClass(previouslySelectedContact, 'selected-contact-box');
    }
    previouslySelectedContact = currentHighlightContact;
}


/**
 * Close contact details
 */
function closeContactOverlay() {
    const contactOverlay = document.getElementById('contactOverlay');
    removeClass(contactOverlay, 'show-contact-selection-overlay');
    removeBodyOverflow();
}


/**
 * Update contact list and load contacts
 */
function updateContactList() {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    loadContacts();
    closeContactOverlay();
}


/**
 * Update contact selection and load contacts
 */
function updateContactSelection() {
    const contactSelection = document.getElementById('contactSelection');
    contactSelection.innerHTML = '';
    loadContacts();
}


/**
 * Reset input fields
 */
function resetInputFields() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('color').value = '#000000';
}


/**
 * Update contact in array, save to server and reload contact list
 * Close contact form
 */
function updateContact() {
    selectedContact.firstName = document.getElementById('firstName').value;
    selectedContact.lastName = document.getElementById('lastName').value;
    selectedContact.email = document.getElementById('email').value;
    selectedContact.phone = document.getElementById('phone').value;
    selectedContact.color = document.getElementById('color').value;
    backend.setItem('contacts', JSON.stringify(contacts));
    updateContactList();
    updateContactSelection();
    const contactForm = document.getElementById("contactFormEdit");
    contactForm.remove(); // close form again
}


/**
 * Show contact form
 */
function showContactForm() {
    const contactForm = document.getElementById("contactForm");
    const contactAddBtn = document.getElementById('contact-add-btn');
    const hideContacts = document.getElementById('hide-contacts');
    const newContactBG = document.getElementById('new-contact-bg');

    removeClass(contactForm, "d-none");
    addClass(contactAddBtn, 'd-none');
    addClass(hideContacts, 'd-none');
    removeClass(newContactBG, 'd-none');
}


/**
 * Open contact form to add new contact
 */
function openAddContactForm() {
    let contactForm = document.getElementById("contactForm");
    removeClass(contactForm, "d-none");
}


/**
 * Close contact form to add new contact
 */
function closeAddContactForm() {
    const contactForm = document.getElementById("contactForm");
    const contactAddBtn = document.getElementById('contact-add-btn');
    const hideContacts = document.getElementById('hide-contacts');
    const newContactBG = document.getElementById('new-contact-bg');

    try {
        addClass(contactForm, "d-none");
        removeClass(contactAddBtn, 'd-none');
        removeClass(hideContacts, 'd-none');
        addClass(newContactBG, 'd-none');
    } catch (err) {
        return;
    }

}


/**
 * Open contact form to edit contact
 * @param {*} i - The index of the contact to be edited in the 'contacts' array. 
 */
function editContact(i) {
    selectedContact = contacts[i];
    const formEditContainer = document.getElementById("formContainer");
    formEditContainer.innerHTML += openEditContactFormHTML(selectedContact);
    currentFormId = document.getElementById('contactFormEdit');

    const contactFormEditBG = document.getElementById('contactFormEdit-bg');
    removeClass(contactFormEditBG, 'd-none');
    addNavFilter();
}


/**
 * Removes the selected contact from the array and updates the contact list
 * i < 7 to disable deleting of test data
 * @param {*} i - The index of the contact to delete 
 */
function deleteSelectedContact(i) {
    contacts.splice(i, 1);
    backend.setItem('contacts', JSON.stringify(contacts));
    updateContactList();
    updateContactSelection();
}


/**
 * Open contact form to add new task with assigned contact
 * @param {string} userShort - The short name of the contact to assign the task to
 */
function addTaskContact(userShort) {
    const formContainer = document.getElementById("formContainer");
    // const formTaskContainer = document.getElementById('formTaskContainer');

    if (!formContainer) {
        console.error('Error: formContainer is null or undefined.');
        return;
    }
    addTaskContactFn(userShort, formContainer);
}


/**
 * Adds a task to a contact and displays the form for adding a task, 
 * while also modifying the UI to show the associated task form container.
 * @param {string} userShort - The user's short name.
 * @param {HTMLElement} formContainer - The container element for the contact form. 
 * @param {HTMLElement} formTaskContainer - The container element for the task form.
 * @param {HTMLElement} nav - The navigation element to add the 'filter' CSS class to.
 */
async function addTaskContactFn(userShort, formContainer) {
    formContainer.innerHTML += openAddTaskContactFormHTML();
    loadSavedCategories();
    addAssignedToList();
    await loadNotes();
    setDateToday();
    checkAssignedTo(userShort);
    currentFormId = document.getElementById('formTaskContainer');
    addNavFilter();
}


/**
 * Check assigned-to checkbox for the given userShort
 * @param {string} userShort - The short name of the contact to check the assigned-to checkbox for
 */
function checkAssignedTo(userShort) {
    for (let i = 0; i < contacts.length; i++) {
        const assignedTo = document.getElementById('assigned-to-' + i);
        if (assignedTo && userShort == assignedTo.value.toLowerCase()) {
            assignedTo.checked = true;
        }
    }
}


/**
 * Close forms by ID (contactForm, formTaskContainer)
 * @param {string} formId - The id of the form to be closed.
 */
function closeFormById(formId) {
    try {
        removeForm(formId);
    } catch (e) {
        try {
            removeNavFilter();
        } catch (err) {
            return;
        }
    }
}


/**
 * Removes a form from the DOM and removes the background overlay.
 * @param {string} formId - The ID of the form element to be removed.
 */
function removeForm(formId) {
    const form = document.getElementById(formId);
    form.remove();
    document.getElementById('contactFormEdit-bg').remove();
    removeNavFilter();
}


/**
 * Loads tasks from server (used for add task-popup)
 */
async function loadNotes() {
    await downloadFromServer();
    tasks = JSON.parse(backend.getItem('allTasks')) || [];
}


/**
 * Saves tasks to server (used for add task-popup)
 */
async function saveNotes() {
    let tasksAsJson = JSON.stringify(tasks);
    await backend.setItem('allTasks', tasksAsJson);
}


/**
 * Tries to close the form element that has the currentFormId, if it exists.
 * @returns - If it doesn't exist, does nothing (Without errors in the console).
 */
function tryCloseFormById() {
    try {
        currentFormId.remove();
        document.getElementById('contact-addTask-bg').remove();
        removeNavFilter();
    } catch (e) {
        try {
            document.getElementById('contactFormEdit-bg').remove();
            removeNavFilter();
        } catch (err) {
            return;
        }
    }
}


/**
 * Removes the current form and its associated background overlay element
 *  and removes the 'filter' CSS class from the specified navigation element.
 * @param {HTMLElement} nav - The navigation element to remove the 'filter' CSS class from.
 */
function removeCurrentForm() {
    currentFormId.remove();
    document.getElementById('contact-addTask-bg').remove();
    removeNavFilter();
}