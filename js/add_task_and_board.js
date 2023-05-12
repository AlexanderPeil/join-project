let contactsAddTask = loadContacts();
let subtasks = [];
let priotity_urgent = false;
let priotity_medium = false;
let priotity_low = true;
let currentCategory = '';
let currentColor = '';
let category;
let selectedColor;
let currentSelectMenu = null;

/**
 * Adds a new task to the tasks array and saves it to storage when the "Add" button is clicked.
 * @returns {Promise<void>}
 */
async function addTask() {
    const title = document.getElementById('title_textfield').value;
    const description = document.getElementById('description_textfield').value;
    const assigned_to = getAssignedUsers();
    const due_date = document.getElementById('date').value;
    const currentSplit = checkStatus();
    if (!isCategoryValid(category)) {
        return;
    }
    new_task = createNewTaskJson(title, description, due_date, currentSplit, assigned_to);
    await addNewTask(new_task);
    await navigateToBoard();
}


/**
 * Retrieves the list of assigned users based on the checked checkboxes.
 * @returns {Array<Object>} An array of objects, each representing an assigned user.
 */
function getAssignedUsers() {
    const assigned_to = [];
    for (let i = 0; i < contactsAddTask.length; i++) {
        if (document.getElementById('assigned-to-' + i).checked) {
            const user = document.getElementById('assigned-to-' + i).value;
            const fullName = document.getElementById('assigned_name' + i).innerHTML;
            const userColor = contactsAddTask[i]['color'];
            assigned_to.push({ 'userShort': user, 'userFullName': fullName, 'color': userColor });
        }
    }
    return assigned_to;
}


/**
 * Checks if the given category is valid, i.e. not undefined.
 * @param {string} category 
 * @returns 
 */
function isCategoryValid(category) {
    const categoryRequired = document.getElementById('category-required');
    if (category === undefined) {
        removeClass(categoryRequired, 'd-none');

        setTimeout(() => {
            addClass(categoryRequired, 'd-none');
        }, 2000);
        return false;
    }
    return true;
}


/**
 * Creates a new task object.
 * @param {Object} new_task - The new task object to create.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} due_date - The due date of the task.
 * @param {string} currentSplit - The current split of the task.
 * @param {Array} assigned_to - An array of objects representing the users assigned to the task.
 * @returns {Object} - The new task object.
 */
function createNewTaskJson(title, description, due_date, currentSplit, assigned_to) {
    return {
        'split': currentSplit,
        'category': category,
        'color': selectedColor,
        'body_header': title,
        'body_content': description,
        'progress': '',
        'users': assigned_to,
        'priotity': checkPrioity(),
        'date': due_date,
        'subtasks': subtasks
    }
}


/**
 * Adds a new task to the task list, clears the subtasks list, and saves the updated task list to the storage.
 * @param {*} new_task - The new task to be added. 
 */
async function addNewTask(new_task) {
    tasks.push(new_task);
    subtasks = [];
    await saveNotes();
}


/**
 * Navigates to the board page, removes popup and unhides board section, and initializes the board
 */
async function navigateToBoard() {
    const boardSection = document.getElementById('board-section');
    window.location.href = './board.html';
    document.getElementById('popUp').innerHTML = '';
    removeClass(boardSection, 'd-none');
    await init();
}


/**
 * Checks the priority level selected and returns the corresponding image and string.
 * @returns {object[]} - An array with an object containing the priority image, string, and white image.
 */
function checkPrioity() {
    let prio;
    let priotity;
    if (priotity_low) {
        prio = "assets/img/low_priotity.png";
        priotity = 'low';
    }
    else if (priotity_medium) {
        prio = "assets/img/medium_priotity.png";
        priotity = 'medium';
    }
    else if (priotity_urgent) {
        prio = "assets/img/high_priotity.png";
        priotity = 'urgent';
    }
    return [{ 'img': prio, 'priotity': priotity, "img_white": "assets/img/Prio-" + priotity + "-white.png" }];
}


/**
 * Changes the color of the priority sections based on the selected priority radio button.
 */
function changeColor() {
    priotity_urgent = document.getElementById('urgentBtn').checked;
    priotity_medium = document.getElementById('mediumBtn').checked;
    priotity_low = document.getElementById('lowBtn').checked;
    checkChangedColor(priotity_urgent, priotity_medium, priotity_low);
}


/**
 * Updates the priority sections on the page based on which priority has been selected.
 * @param {*} priotity_urgentt - A boolean indicating whether the urgent priority has been selected. 
 * @param {*} priotity_medium - A boolean indicating whether the medium priority has been selected. 
 * @param {*} priotity_low - A boolean indicating whether the low priority has been selected. 
 */
function checkChangedColor(priotity_urgent, priotity_medium, priotity_low) {
    if (priotity_urgent) {
        setPrioUrgent();
    }
    if (priotity_medium) {
        setPrioMedium();
    }
    if (priotity_low) {
        setPrioLow();
    }
}


/**
 * Sets the priority section to urgent.
 */
function setPrioUrgent() {
    document.getElementById('urgentSection').innerHTML = loadPrioIMGWithText('Urgent', 'Prio-urgent-white');
    document.getElementById('mediumSection').innerHTML = loadPrioIMGWithText('Medium', 'Prio-medium');
    document.getElementById('lowSection').innerHTML = loadPrioIMGWithText('Low', 'Prio-low');
}


/**
 * Sets the priority section to medium.
 */
function setPrioMedium() {
    document.getElementById('urgentSection').innerHTML = loadPrioIMGWithText('Urgent', 'Prio-urgent');
    document.getElementById('mediumSection').innerHTML = loadPrioIMGWithText('Medium', 'Prio-medium-white');
    document.getElementById('lowSection').innerHTML = loadPrioIMGWithText('Low', 'Prio-low');
}


/**
 * Sets the priority section to low.
 */
function setPrioLow() {
    document.getElementById('urgentSection').innerHTML = loadPrioIMGWithText('Urgent', 'Prio-urgent');
    document.getElementById('mediumSection').innerHTML = loadPrioIMGWithText('Medium', 'Prio-medium');
    document.getElementById('lowSection').innerHTML = loadPrioIMGWithText('Low', 'Prio-low-white');
}


/**
 * 	Loads the user contacts from a JSON file and sets them to the "contacts" variable.
*/
async function loadContacts() {
    await downloadFromServer();
    contactsAddTask = JSON.parse(backend.getItem('contacts')) || [];
}


/**
 * Adds assigned contacts to the list of choices in the "Add Task" form.
 * The function clears the previous choices and loops through the contactsAddTask
 * array to create a new line for each contact, consisting of a checkbox and the contact's full name.
 */
function addAssignedToList() {
    document.getElementById('assigned-to-choices').innerHTML = '';
    for (let i = 0; i < contactsAddTask.length; i++) {
        const contact = contactsAddTask[i];
        let firstName = contact['firstName'];
        let lastName = contact['lastName'];
        let acronym = firstName[0] + lastName[0];
        document.getElementById('assigned-to-choices').innerHTML += `<div class="assigned-to-line"><label for="assigned-to-${i}" class="cursor-pointer" id="assigned_name${i}">${firstName + ' ' + lastName}</label><input type="checkbox" class="cursor-pointer" id="assigned-to-${i}" value="${acronym}"></div>`
    }
}


/**
 * Toggles the visibility of a dropdown list.
 * @param {string} id - The id of the element to toggle.
 */
function openDropdown(id) {
    let currentDropDown = document.getElementById(id);
    currentSelectMenu = id;
    if (id == currentSelectMenu && !document.getElementById(id).classList.contains('d-none')) {
        addClass(currentDropDown, 'd-none');
    } else {
        var dropdowns = document.querySelectorAll('.category-assigned-to');
        for (var i = 0; i < dropdowns.length; i++) {
            addClass(dropdowns[i], 'd-none');
        }
        var dropdown = document.getElementById(id);
        if (dropdown.classList.contains('d-none')) {
            dropdown.classList.remove('d-none');
        } else {
            addClass(dropdown, 'd-none');
        }
    }
}


/**
 * Closes the category and assigned-to select wrapper containers.
 * @returns - 
 */
function closeSelectWrapper() {
    const category = document.getElementById('category-choices');
    const assignedTo = document.getElementById('assigned-to-choices');
    try {
        addClass(category, 'd-none');
        addClass(assignedTo, 'd-none');
    } catch (err) {
        return;
    }
}


/**
 * Changes the text in the category header.
 * @param {string} name - The new category name.
 */
function changeCategoryHeader(name) {
    document.getElementById('category-header').innerHTML = name;
    category = name;
    currentCategory = category;
    categorySelected(name);
}


/**
 * Sets the selected color and category based on the given categoryId.
 * @param {*} categoryId - The ID of the category to be selected. 
 */
function categorySelected(categoryId) {
    if (categoryId === 'Marketing') {
        categoryMarketing();
    } else if (categoryId === 'Media') {
        categoryMedia();
    } else if (categoryId === 'Backoffice') {
        categoryBackoffice();
    } else if (categoryId === 'Design') {
        categoryDesign();
    } else {
        categorySales();
    }
    currentColor = selectedColor;
}


/**
 * Sets the category to 'Marketing' and the selected color to blue (#0038ff).
 */
function categoryMarketing() {
    selectedColor = '#0038ff';
    category = 'Marketing';
}


/**
 * Sets the category to 'Media' and the selected color to yellow  (#ffc702).
 */
function categoryMedia() {
    selectedColor = '#ffc702';
    category = 'Media';
}


/**
 * Sets the category to 'Backoffice' and the selected color to teal (#1FD7C1).
 */
function categoryBackoffice() {
    selectedColor = '#1FD7C1';
    category = 'Backoffice';
}


/**
 * Sets the category to 'Design' and the selected color to orange (#ff7a00).
 */
function categoryDesign() {
    selectedColor = '#ff7a00';
    category = 'Design';
}


/**
 * Sets the category to 'Sales' and the selected color to pink (#fc71ff).
 */
function categorySales() {
    selectedColor = '#fc71ff';
    category = 'Sales';
}


/**
 * Adds a new color category based on the values entered in the input fields.
 */
function addColorCategory() {
    const categoryInput = document.getElementById('new-category-input');
    const categoryAdded = document.getElementById('category-added-cont');
    if (!checkNewCategoryInput()) {
        return;
    }
    selectedColor = document.getElementById('category-color').value;
    category = categoryInput.value;
    addClass(categoryInput, 'd-none');
    removeClass(categoryAdded, 'd-none');
    showCategoryInput(categoryAdded, categoryInput);
    currentCategory = category;
    currentColor = selectedColor;
}


/**
 * Shows category input and hides category added message after a delay.
 * @param {*} categoryAdded - The element displaying the message that the category was added 
 * @param {*} categoryInput - The input element for adding a new category
 */
function showCategoryInput(categoryAdded, categoryInput) {
    setTimeout(() => {
        addClass(categoryAdded, 'd-none');
        removeClass(categoryInput, 'd-none');
    }, 1500);
}



/**
 * Checks if the input for adding a new category is not empty
 * @returns {boolean} Returns true if the input for adding a new category is not empty, otherwise false. 
 */
function checkNewCategoryInput() {
    const newCategoryInput = document.getElementById('new-category-input');
    const categoryRequired = document.getElementById('category-required');
    if (newCategoryInput.value === '') {
        removeClass(categoryRequired, 'd-none');
        addClass(newCategoryInput, 'd-none');
        setTimeout(() => {
            addClass(categoryRequired, 'd-none');
            removeClass(newCategoryInput, 'd-none');
        }, 2000);
        return false;
    }
    return true;
}


/**
 * Changes the subtask icons to the "clear" and "add" icons when the subtask input field is clicked.
 */
function changeSubIcon() {
    hideAddSubtaskImg();
}


/**
 * Changes the subtask icons to the "clear" and "add" icons when the input field is changed.
 */
function inputChangeSubIcons() {
    hideAddSubtaskImg(); 
}


/**
 * Sets the subtask images according to their status.
 * The plus subtask image is hidden and the clear subtask and add subtask images are shown.
 */
function hideAddSubtaskImg() {
    const plusSubtaskimg = document.getElementById('plusSubtaskImg');
    const clearSubtaskImg = document.getElementById('clearSubtaskImg');
    const addSubtastImg = document.getElementById('addSubtaskImg');
    addClass(plusSubtaskimg, 'd-none');
    removeClass(clearSubtaskImg, 'd-none');
    removeClass(addSubtastImg, 'd-none');
}


/**
 * Adds a subtask to the list and the subtasks array when the "Add" button is clicked.
 */
function addSubtask() {
    let subtask = document.getElementById('subtask').value;
    if (!subtask == '') {
        const uniqueId = Date.now().toString() + '-delete-subtask';
        document.getElementById('subtask-list').innerHTML += `<li id="${uniqueId}">${subtask}<img src="./assets/img/xicon.png" class="delete-subtask" onclick="deleteSubtask('${uniqueId}')"></li>`;
        document.getElementById('subtask').value = '';
        subtasks.push({
            'subtaskName': subtask,
            'status': 'undone'
        });
    }
    showAddSubtaskImg();
}


/**
 * Deletes a subtask element from the UI and removes it from the subtasks array.
 * @param {string} uniqueId - The unique identifier of the subtask element to delete.
 */
function deleteSubtask(uniqueId) {
    const subtaskElement = document.getElementById(uniqueId);
    if (subtaskElement) {
        subtaskElement.remove();
    }
    subtasks.splice(uniqueId, 1);
}


/**
 * Displays the "Add Subtask" image button and hides the "Clear Subtask" and "Plus Subtask" buttons.
 */
function showAddSubtaskImg() {
    const plusSubtaskimg = document.getElementById('plusSubtaskImg');
    const clearSubtaskImg = document.getElementById('clearSubtaskImg');
    const addSubtastImg = document.getElementById('addSubtaskImg');
    removeClass(plusSubtaskimg, 'd-none');
    addClass(clearSubtaskImg, 'd-none');
    addClass(addSubtastImg, 'd-none');
}


/**
 * Clears the subtask input field and changes the subtask icons back to the "plus" icon.
 */
function clearSubtask() {
    document.getElementById('subtask').value = "";
    showAddSubtaskImg();
}


/**
 * Clears all fields and checkboxes in the task form.
 */
function clearAll() {
    document.getElementById('title_textfield').value = '';
    document.getElementById('description_textfield').value = '';
    document.getElementById('category-header').innerHTML = 'Select your Category';
    for (let i = 0; i < contactsAddTask.length; i++) {
        if (document.getElementById('assigned-to-' + i).checked) {
            document.getElementById('assigned-to-' + i).checked = false;
        }
    }
    document.getElementById('date').value = '';
    document.getElementById('subtask-list').innerHTML = '';
}


/**
 * Set the Current Date to today
 * @param {string} today - The new Date.
 */
function setDateToday() {
    let today = new Date().toISOString().split('T')[0];
    document.getElementById("date").setAttribute('min', String(today));
}


/**
 * Fills the task popup form with task data, given the task ID
 * @param {*} id - The ID of the task to be filled in the form 
 */
function fillTheTasks(id) {
    let title = tasks[id]['body_header'];
    let text = tasks[id]['body_content'];
    let category = tasks[id]['category'];
    let date = tasks[id]['date'];
    let prio = tasks[id]['priotity'][0]['priotity'];
    let thisSubtasks = tasks[id]['subtasks'];
    checkPrioButton(prio);
    changeColor();
    getValueFromTaskInputs(title, text, category, date);
    loopThroughUsers(id);
    loopThroughSubtasks(thisSubtasks);
}


/**
 * Updates the priority buttons according to the selected priority.
 * @param {*} prio - The selected priority ('urgent' or 'medium'). 
 */
function checkPrioButton(prio) {
    if (prio == 'urgent') {
        priotity_urgent = document.getElementById('urgentBtn').checked = true;
        priotity_medium = document.getElementById('mediumBtn').checked = false;
        priotity_low = document.getElementById('lowBtn').checked = false;
    }
    else if (prio == 'medium') {
        priotity_urgent = document.getElementById('urgentBtn').checked = false;
        priotity_medium = document.getElementById('mediumBtn').checked = true;
        priotity_low = document.getElementById('lowBtn').checked = false;
    }
}


/**
 * Sets the values of the task inputs based on the provided parameters.
 * @param {*} title - The title of the task to set in the title textfield. 
 * @param {*} text - The description of the task to set in the description textfield. 
 * @param {*} category - The category of the task to set as the category header. 
 * @param {*} date - The date of the task to set in the date input field. 
 */
function getValueFromTaskInputs(title, text, category, date) {
    document.getElementById('title_textfield').value = title;
    document.getElementById('description_textfield').value = text;
    document.getElementById('category-header').innerHTML = category;
    document.getElementById('date').value = date;
}


/**
 * Iterates through the users assigned to a task and checks the corresponding checkboxes
 * @param {*} id - The ID of the task to loop through users for 
 */
function loopThroughUsers(id) {
    for (let j = 0; j < tasks[id]['users'].length; j++) {
        const user = tasks[id]['users'][j];
        for (let i = 0; i < contactsAddTask.length; i++) {
            if (document.getElementById('assigned-to-' + i).value == user['userShort']) {
                document.getElementById('assigned-to-' + i).checked = true;
            }
        }
    }
}


/**
 * Loops through an array of subtasks and appends each subtask name to an HTML unordered list element with the ID 'subtask-list'.
 * @param {*} thisSubtasks - An array of subtasks to loop through. 
 */
function loopThroughSubtasks(thisSubtasks) {
    for (let s = 0; s < thisSubtasks.length; s++) {
        const subtask = thisSubtasks[s];
        document.getElementById('subtask-list').innerHTML += `<li>${subtask['subtaskName']}</li>`;
    }
}


/**
 * Edits an existing task by updating its properties and saves the changes.
 * @param {*} id - The id of the task to be edited. 
 */
async function editAddTask(id) {
    let title = document.getElementById('title_textfield').value;
    let description = document.getElementById('description_textfield').value;
    category = currentCategory || tasks[id]['category'];
    selectedColor = currentColor || tasks[id]['color'];
    let assigned_to = getAssignedUsers();
    let due_date = document.getElementById('date').value;
    if (!isCategoryValid(category)) return;
    // let existingSubtasks = tasks[id]['subtasks'];
    // new_task = createEditedTaskJson(id, title, description, assigned_to, due_date, existingSubtasks);
    subtasks = [];
    tasks[id] = new_task;
    await saveNotes();
    showBoard();
}


/**
 * Removes the popup-add-task and close-add-task elements and enables the body overflow.
 */
function showBoard() {
    document.getElementById('popup-add-task').remove();
    document.getElementById('close-add-task').remove();
    removeBodyOverflow();
}


/**
 * Creates a JSON object representing the edited task.
 * @param {*} id - The ID of the task being edited. 
 * @param {*} title - The title of the task. 
 * @param {*} description - The description of the task. 
 * @param {*} assigned_to - An array of users assigned to the task 
 * @param {*} due_date - The due date of the task. 
 * @returns {object} - A JSON object representing the edited task. 
 */
function createEditedTaskJson(id, title, description, assigned_to, due_date) {
    return {
        'split': tasks[id]['split'],
        'category': category,
        'color': selectedColor,
        'body_header': title,
        'body_content': description,
        'progress': '',
        'users': assigned_to,
        'priotity': checkPrioity(),
        'date': due_date,
        'subtasks': subtasks
    }
}


/**
 * Opens a new category input field.
 */
function openAddNewCategory() {
    const selectWrapper = document.getElementById('select-wrapper');
    const newCategory = document.getElementById('new-category');
    addClass(selectWrapper, 'd-none');
    removeClass(newCategory, 'd-none');
}


/**
 * Closes the new category input field.
 */
function closeNewCategory() {
    showNewCategory();
}


/**
 * Ads a new category.
 */
function addNewCategory() {
    const newCat = document.getElementById('new-category-input').value;
    currentCategory = newCat;
    document.getElementById('category-header').innerHTML = newCat;
    showNewCategory();
}


/**
 * Displays the "select category" dropdown and hides the "new category" input field.
 */
function showNewCategory() {
    const selectWrapper = document.getElementById('select-wrapper');
    const newCategory = document.getElementById('new-category');
    removeClass(selectWrapper, 'd-none');
    addClass(newCategory, 'd-none');
}