const addBtn = document.querySelector('.chat-btn'),
    messengeList = document.querySelector('.dialog'),
    messengeLimit = document.querySelector('.chat-count'),
    inputMessenge = document.querySelector('.chat-input'),

    symbolLimit = 100,
    userName = 'Гость';


function addMessenge() {
    let userInput = inputMessenge.value;
    if (!addBtn.classList.contains('active')) return;
    inputMessenge.value = '';

    let listItem = document.createElement('li');
    listItem.innerHTML = `
    <img class="user-icon" src="icons/user.svg" alt=""><span class="user-name">${userName}</span>
    <p>${userInput}</p>`
    messengeList.appendChild(listItem);
    messengeLimit.innerHTML = `0/${symbolLimit}`

    addBtn.classList.remove('active');
    messengeLimit.classList.remove('active');
}

function countSmbl() {
    let userInput = inputMessenge.value;
    if (userInput === '')
        addBtn.classList.remove('active');
    else
        addBtn.classList.add('active');

    if (userInput.length > symbolLimit) {
        inputMessenge.value = userInput = userInput.substring(0, symbolLimit);
        messengeLimit.classList.add('active');
    } else
        messengeLimit.classList.remove('active');

    messengeLimit.innerHTML = `${userInput.length}/${symbolLimit}`
}

addBtn.addEventListener('click', addMessenge, false);
inputMessenge.addEventListener('input', countSmbl, false);
inputMessenge.addEventListener('keydown', (e) => {
    var code = e.keyCode;
    switch (code) {
        case 13:// enter
            addMessenge();
            break;
    }
}, false);