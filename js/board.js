let tasks = [];
let users_color = loadContacts();
let onMobile = isMobileDevice();
let currentDraggedElement;
let splits = ['to_do', 'in_progress', 'awaiting_feedback', 'done'];
let currentWishMenu = null;
let curentDraggedCard;


/**
 * Initializes the page by including the HTML, loading the notes,
 * and loading the board with the initial set of tasks.
 */
async function init() {
    currentSection = "board-page";
    includeHTML();
    await loadNotes();
    loadBoard(tasks);
    loadContacts();
    setCurrentSectionStyle();
}


/**
 * Loads the board with the specified set of tasks, cleaning out any
 * existing content and adding new content to the board.
 * @param {array} choiceTasks - The set of tasks to load onto the board.
 */
function loadBoard(choiceTasks) {
    cleanOldBoard();
    loadNewBoard(choiceTasks);
}


/**
 * This function cleans the old Kanban Board.  
 */
function cleanOldBoard() {
    document.getElementById('to_do').innerHTML = '';
    document.getElementById('in_progress').innerHTML = '';
    document.getElementById('awaiting_feedback').innerHTML = '';
    document.getElementById('done').innerHTML = '';
}


/**
 * Loads a new task board with the specified tasks.
 * @param {Array} toLoadTasks - An array of tasks to load on the board.
 */
function loadNewBoard(toLoadTasks) {
    for (let i = 0; i < toLoadTasks.length; i++) {
        const task = toLoadTasks[i];
        document.getElementById(task['split']).innerHTML += loadCardBoardText(task, i);
        loadUsersBoard(task, i);
        loadSubtasks(task, i);
    }
}


/**
 * Loads users into task card's user section.
 * @param {Object} task - The task object.
 * @param {number} i - The index of the task in the array of tasks.
 */
function loadUsersBoard(task, i) {
    let usersHTML = '';
    let additionalUsersHTML = '';
    let showMoreUsers = task['users'];
    for (let j = 0; j < task['users'].length; j++) {
        const user = task['users'][j];
        if (j < 3) {
            usersHTML += loadUserShortsTmp(user);
        } else {
            additionalUsersHTML += loadUserShortsTmp(user);
        }
    }
    document.getElementById('users' + i).innerHTML += usersHTML;
    checkAdditionalUsers(additionalUsersHTML, showMoreUsers, i);
}


/**
 * Checks if there are additional users to display and,
 * if so, updates the UI to show a button that can be used to display them.
 * @param {string} additionalUsersHTML - The HTML content for the additional users to display.
 * @param {string} showMoreUsers - The string representing the number of additional users to display (e.g., '+3').
 * @param {number} i - The index of the current item.
 */
function checkAdditionalUsers(additionalUsersHTML, showMoreUsers, i) {
    let showuserBtn = document.getElementById('show-users-btn' + i);

    if (additionalUsersHTML !== '') {
        document.getElementById('additional-users' + i).innerHTML = loadAdditionalUsersTmp(showMoreUsers.slice(3));
        removeClass(showuserBtn, 'd-none');
    }
}


/**
 * Shows more users for a given id and hides the corresponding button.
 * @param {Event} event - The event object that triggered the function.
 * @param {Number} id - The id of the container to show more users for.
 */
function showMoreUsers(event, id) {
    event.stopPropagation();

    const moreUserCont = document.getElementById('more-user-container' + id);
    const showUserBtn = document.getElementById('show-users-btn' + id);
    const hideuserBtn = document.getElementById('hide-users-btn' + id);

    removeClass(moreUserCont, 'd-none');
    addClass(showUserBtn, 'd-none');
    removeClass(hideuserBtn, 'd-none');
}


/**
 * Hides users to show max. three users. 
 * @param {Event} event - The event object that triggered the function.  
 * @param {*} id - The id of the container to hide users for. 
 */
function hideUsers(event, id) {
    event.stopPropagation();

    const moreUserCont = document.getElementById('more-user-container' + id);
    const showUserBtn = document.getElementById('show-users-btn' + id);
    const hideuserBtn = document.getElementById('hide-users-btn' + id);

    addClass(moreUserCont, 'd-none');
    removeClass(showUserBtn, 'd-none');
    addClass(hideuserBtn, 'd-none');
}


/**
 * Loads subtasks into task card's subtask section.
 * @param {Object} task - The task object.
 * @param {number} i - The index of the task in the array of tasks.
 */
function loadSubtasks(task, i) {
    if (task['subtasks'].length > 0) {
        let doneTasks = 0;
        let sumTasks = task['subtasks'].length;
        for (let t = 0; t < task['subtasks'].length; t++) {
            const subtask = task['subtasks'][t];
            if (subtask['status'] == 'done') {
                doneTasks++;
            };
        }
        document.getElementById('progress' + i).innerHTML = loadSubtaskBoardtmp(doneTasks, sumTasks);
    }
}


/**
 * Opens the add task pop-up window.
 * @param {number} id - The id of the task to add.
 */
function openAddTask(id) {
    const boardSection = document.getElementById('board-section');
    const popupBG = document.getElementById('popUp-background');

    currentTaskCard = id;
    document.getElementById('popUp').innerHTML = loadAddTaskTmp();
    addClass(boardSection, 'd-none');
    addAssignedToList();
    setDateToday();

    try {
        addClass(popupBG, 'filter');
    } catch (err) {
        return;
    }
}


/**
 * Sets the current dragged element.
 * @param {string} id - The id of the element being dragged.
 */
function startDragging(id) {
    currentDraggedElement = id;
}


/**
 * Allows elements to be dropped into the drop area.
 * @param {Object} ev - The event object.
 * @param {number} test - A test parameter.
 */
function allowDrop(ev, test) {
    ev.preventDefault();
    let dropArea = document.getElementById('dropArea_' + test);

    addClass(dropArea, 'borders');
}


/**
 * Disables drop of elements.
 * @param {string} ev - The event object.
 */
function disableDrop(ev) {
    let dropArea = document.getElementById('dropArea_' + ev); 

    removeClass(dropArea, 'borders');
}


/**
 * Moves the dragged element to another category.
 * @param {string} category - The category to move the element to.
 */
async function moveTo(category) {
    let dropArea = document.getElementById('dropArea_' + category);

    removeClass(dropArea, 'borders');
    tasks[currentDraggedElement]['split'] = category;
    loadBoard(tasks);
    await saveNotes();
}


/**
 * Loads the tasks from the server.
 */
async function loadNotes() {
    await downloadFromServer();
    tasks = JSON.parse(backend.getItem('allTasks')) || [];
}


/**
 * Saves the notes to the server.
 */
async function saveNotes() {
    let tasksAsJson = JSON.stringify(tasks);
    await backend.setItem('allTasks', tasksAsJson);
}


/**
 * Opens a full view of a task card.
 * @param {number} choiceTask - The index of the task in the array of tasks.
 */
function openTaskFull(choiceTask) {
    document.getElementById('popUp').innerHTML = loadCardFullText(tasks, choiceTask);
    loadSubtaksToFullTask(choiceTask);
    loadUsersToFullTask(choiceTask);

    addBodyOverflow();
    
    let closePopup = document.getElementById('close-popup' + choiceTask);
    addClass(closePopup, 'filter');
}


/**
 * Loads the subtasks to the full task view.
 * @param {number} choiceTask - The index of the task in the array of tasks.
 */
function loadSubtaksToFullTask(choiceTask) {
    const subtasks = tasks[choiceTask]['subtasks'];
    if (subtasks.length > 0) {
        for (let i = 0; i < subtasks.length; i++) {
            taskDone = 'checked'
            if (subtasks[i]['status'] == 'undone') {
                taskDone = '';
            }
            document.getElementById('subtaskSection').innerHTML += 
            `<label for="subtask_${i}">${tasks[choiceTask]['subtasks'][i]['subtaskName']}<input type="checkbox" ${taskDone} id="subtask_${i}"></label>`
        }
    } else {
        document.getElementById('subtaskSectionCheck').innerHTML = '';
    }
}


/**
 * Loads the users to the full task view.
 * @param {number} choiceTask - The index of the task in the array of tasks.
 */
function loadUsersToFullTask(choiceTask) {
    if (tasks[choiceTask]['users'].length > 0) {
        let users = tasks[choiceTask]['users']
        for (let u = 0; u < users.length; u++) {
            document.getElementById('userSection').innerHTML += loadTextUsersForFullTask(users, u);
        }
    }
}


/**
 * Closes the task pop-up window.
 * @param {number} currentCard - The index of the task in the array of tasks.
 */
async function closePopUp(currentCard) {
    removeBodyOverflow();
    checkSubtaskDone(currentCard)
    await saveNotes();
    document.getElementById('popUp').innerHTML = '';
    loadBoard(tasks);
}


/**
 * Checks if a subtask is done and updates the task accordingly.
 * @param {number} currentCard - The index of the task in the array of tasks.
 */
function checkSubtaskDone(currentCard) {
    for (let i = 0; i < tasks[currentCard]['subtasks'].length; i++) {
        let isDone = false;
        isDone = document.getElementById('subtask_' + i).checked;
        if (isDone) {
            tasks[currentCard]['subtasks'][i]['status'] = 'done';
        }
        else {
            tasks[currentCard]['subtasks'][i]['status'] = 'undone';
        }
    }
}


/**
 * Deletes a task from the array of tasks.
 * @param {number} choicCard - The index of the task in the array of tasks.
 */
async function delCard(choicCard) {
    tasks.splice(choicCard, 1);
    await saveNotes();
    document.getElementById('popUp').innerHTML = '';
    loadBoard(tasks);
}


/**
 * Closes the pop-up for adding a task.
 */
function closePopUpAddTask() {
    const boardSection = document.getElementById('board-section');
    const closeAddTask = document.getElementById('close-add-task');

    try {
        document.getElementById('popUp').innerHTML = '';
        removeClass(boardSection, 'd-none');
        removeBodyOverflow();
        removeClass(closeAddTask, 'filter');
    } catch (err) {
        return;
    }
}


/**
 * Searches the kanban board for tasks that match the given search query.
 * @param {Array} kanbanBoard - The array of tasks to search.
 * @param {string} searchQuery - The search query string.
 * @returns {Array} - An array of tasks that match the search query.
 */
function searchKanbanBoard(kanbanBoard, searchQuery) {
    const results = [];

    for (const card of kanbanBoard) {
        if (card.body_header.toLowerCase().includes(searchQuery) || card.body_content.toLowerCase().includes(searchQuery)) {
            results.push(card);
        }
    }
    return results;
}


/**
 * Finds tasks that match the search query and loads them onto the kanban board.
 */
function findTasks() {
    let searchQuery = document.getElementById('findTask').value;
    searchQuery = searchQuery.toLowerCase();

    let searchedTasks = searchKanbanBoard(tasks, searchQuery);
    loadBoard(searchedTasks);
}


/**
 * Checks if the device is a mobile device.
 * @returns {boolean} - true if the device is a mobile device, false otherwise.
 */
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}


/**
 * Determines which menu to open based on the device type.
 * @param {string} id - The task ID.
 */
function checkWhichMenu(id) {
    if (currentWishMenu !== null && currentWishMenu !== id) {
        closeAllMenus();
    }

    let check = false;
    if (checkMobile()) {
        check = true;
    }
    if (!check) {
        openTaskFull(id);
    } else {
        openContextMenu(id);
    }
}


/**
 * Checks if the current user agent is a mobile device based on a regular expression test.
 * @returns {boolean} Returns true if the current user agent is a mobile device, false otherwise.
 */
function checkMobile() {
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))
}


/**
 * Opens the context menu for the given task ID.
 * @param {string} id - The task ID.
 */
function openContextMenu(id) {
    let contextMenu = document.getElementById(`contextMenu${id}`);

    removeClass(contextMenu, 'd-none');
    currentWishMenu = id;
}


/**
 * Closes all wish menus by adding 'd-none' class to them.
 * Sets 'currentWishMenu' to null.
 */
function closeAllMenus() {
    const menus = document.querySelectorAll('.popUpWish');
    
    menus.forEach((menu) => {
        menu.classList.add('d-none');
    });
    currentWishMenu = null;
}


/**
 * Hides the context menu.
 * @param {string} id - The ID of the context menu to hide.
 */
function closeHeadContextMenu(id) {
    let contextmenu = document.getElementById(`contextMenu${id}`);
    addClass(contextmenu, 'd-none');
}


/**
 * Sets the 'active' class to the current section in the navigation bar 
 * based on the value of the global variable 'currentSection'.
 * @returns - If the current section is not recognized or cannot be found, 
 *            this function returns immediately.
 */
function closeWishMenu() {
    try {
        id = currentWishMenu;
        closeHeadContextMenu(id);
        removeBodyOverflow();
    } catch (error) {
        return;
    }
}


/**
 * Changes the split value of the given task.
 * @param {string} split - The new split value.
 * @param {string} id - The task ID.
 */
async function changeSplit(split, id) {
    tasks[id]['split'] = split;
    await saveNotes();
    cleanOldBoard();
    loadNewBoard(tasks);
}


/**
 * Function to edit a task
 * @param {string} id - The id of the task to edit
 */
function editTask(id) {
    document.getElementById('popUp').innerHTML = loadEditAddTaskTmp(id);
    const closeAddTask = document.getElementById('close-add-task');
    
    addAssignedToList();
    setDateToday();
    fillTheTasks(id)
    addBodyOverflow();
    addClass(closeAddTask, 'filter');
}


/**
 * Hides the the popup.
 * @param {string} currentCard - The ID of the card for which to close the popup.
 */
function closePopup(currentCard) {
    let closePopup = document.getElementById(`close-popup${currentCard}`); 

    addClass(closePopup, 'd-none');
    removeBodyOverflow();
}


/**
 * Closes the add task popup window.
 */
function closePopupAddTask() {
    const popupBG = document.getElementById('popUp-background');
    const boardSection = document.getElementById('board-section');

    addClass(popupBG, 'd-none');
    removeClass(boardSection, 'd-none');
}


/**
 * Closes add task popup.
 */
function closeAddtask() {
    const closeAddTask = document.getElementById('close-add-task');

    addClass(closeAddTask, 'd-none');
    removeBodyOverflow();
    removeClass(closeAddTask, 'filter');
} 