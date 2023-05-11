let users = [];
let currentUser;
let currentTaskCard;
let previousMenuItem = null;
let currentSection;



function init() {
    includeHTML();
}


/**
 * Sets the 'active' class to the current section in the navigation bar based on the value of the global variable 'currentSection'.
 * @returns - If the current section is not recognized or cannot be found, this function returns immediately.
 */
function setCurrentSectionStyle() {
    try {
        if (currentSection == 'summary-page') {
            document.getElementById('summary').classList.add('active');
        } else if (currentSection == 'board-page') {
            document.getElementById('board').classList.add('active');
        } else if (currentSection == 'add-task-page') {
            document.getElementById('add-task').classList.add('active');
        } else if (currentSection == 'contact-page') {
            document.getElementById('contact').classList.add('active');
        }
    } catch (error) {
        return;
    }
}


/**
 * Loads the users from the backend storage and sets the currentUser.
 * @returns {Promise} Promise that resolves when the users are loaded.
 */
async function loadUsers() {
    await downloadFromServer();
    users = JSON.parse(backend.getItem('users')) || [];
    currentUser = JSON.parse(backend.getItem('current-user')) || [];
}


/**
 * Displays a pop-up menu for the logout option.
 */
function showLogout() {
    let logOut = document.getElementById('popup-menu');
    logOut.classList.remove('d-none');
}


/**
 * Hides the logout menu.
 */
function closeLogoutMenu() {
    let logOut = document.getElementById('popup-menu');
    logOut.classList.add('d-none');
}


/**  
 * Prevent closing the logout menu by clicking on it
 */
function dontClose(event) {
    event.stopPropagation();
}


/**
 * Logs out the current user by deleting their information from the local storage and redirecting the user to the index page.
 */
function logOut() {
    localStorage.removeItem('current-user');
    window.location.href = 'index.html';
}


/**
 * Check if the 'remember me' checkbox is checked, and if so, call the setRememberMeLocal function.
 * @param {object} currentUser - The currently logged-in user object.
 */
function checkRememberMe(currentUser) {
    let rememberMe = document.getElementById('remember-me');

    if (rememberMe.checked == true) {
        setRememberMeLocal(currentUser);
    }
}


/**
 * This function deletes the saved user email and password from local storage if the "remember me" checkbox is unchecked.
 */
function deleteRememberMe() {
    let rememberMe = document.getElementById('remember-me');

    if (rememberMe.checked == false) {
        localStorage.removeItem('current-email');
        localStorage.removeItem('current-password');
    }
}


/**
 * Sets the current user's email and password in local storage if the "Remember Me" checkbox is checked.
 * @param {object} currentUser - The current user object containing email and password.
 */
function setRememberMeLocal(currentUser) {
    localStorage.setItem('current-email', currentUser.email);
    localStorage.setItem('current-password', currentUser.password);
}


/**
 * Retrieves the email address of the user that was stored in local storage when the "remember me" checkbox was checked during a previous login.
 * @returns {string} the email address of the user.
 */
function getRememberMeEmail() {
    return localStorage.getItem('current-email');
}


/**
 *  Retrieves the password of the user that has checked the "Remember me" option.
 * @returns {string} the password of the remembered user.
 */
function getRememberMePassword() {
    return localStorage.getItem('current-password');
}


/**
 * This function checks if there is any stored email and password in the local storage. 
 */
function checkRememberMeData() {
    let emailValue = getRememberMeEmail();
    let passswordValue = getRememberMePassword();

    if (getRememberMeEmail()) {
        document.getElementById('email').value = emailValue;
        document.getElementById('password').value = passswordValue;
    }
}


/**
 * Checks the current status of the task card.
 * @returns {string} - The current status of the task card, either 'to_do' or the value of 
 */
function checkStatus() {
    let status;
    try {
        status = currentTaskCard;
    } catch (e) { }

    if (status) {
        return status;
    } else {
        return 'to_do'
    }
}


/**
 * Adds a CSS class to the specified element.
 * @param {Element} element - The element to add the class to.
 * @param {string} className - The name of the class to add.
 */
function addClass(element, className) {
    element.classList.add(className);
}


/**
 * Removes a CSS class from the specified element.
 * @param {Element} element - The element to remove the class from.
 * @param {string} className - The name of the class to remove.
 */
function removeClass(element, className) {
    element.classList.remove(className);
}


/**
 * Add overflow to the body.
 */
function addBodyOverflow() {
    document.body.classList.add('overflow-hidden');
}


/**
 * Remove overflow from the body.
 */
function removeBodyOverflow() {
    document.body.classList.remove('overflow-hidden');
}


/**
 * Add Filter to the nav.
 */
function addNavFilter() {
    addClass(nav, 'filter');
}


/**
 * Remove Filter from the nav.
 */
function removeNavFilter() {
    removeClass(nav, 'filter');
}