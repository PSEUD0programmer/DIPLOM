const addBtn = document.querySelector('.chat-btn'),
    messengeList = document.querySelector('.dialog'),
    messengeLimit = document.querySelector('.chat-count'),
    inputMessenge = document.querySelector('.chat-input'),

    symbolLimit = 100,
    userName = 'ТЕСТ';


function addMessenge() {
    let userInput = inputMessenge.value;
    if (userInput === '') return;
    inputMessenge.value = '';

    let listItem = document.createElement('li');
    listItem.innerHTML = `
    <img class="user-icon" src="icons/user.svg" alt=""><span class="user-name">${userName}</span>
    <p>${userInput}</p>`
    messengeList.appendChild(listItem);
    messengeLimit.innerHTML = `0/${symbolLimit}`
}

function countSmbl() {
    let userInput = inputMessenge.value;
    if (userInput.length > symbolLimit) {
        inputMessenge.value = userInput = userInput.slice(0, -1);
        messengeLimit.classList.add('active');
    } else
        messengeLimit.classList.remove('active');
    messengeLimit.innerHTML = `${userInput.length}/${symbolLimit}`
}

addBtn.addEventListener('click', addMessenge, false)
inputMessenge.addEventListener('input', countSmbl, false)