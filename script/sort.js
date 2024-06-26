const playerList = [
    {
        uid: '#0001',
        name: 'Шишкин',
        level: 11,
        role: 'Игрок',
        online: true,

        profile: {
            img: 'img/1.png',
            about: 'Я исследователь, инженер, художник и изобретатель. Я всегда стремлюсь к знаниям и понимаю мир через наблюдение и эксперименты.'
        }
    },
    {
        uid: '#0002',
        name: 'Олег',
        level: 99,
        role: 'Игрок',
        online: true,

        profile: {
            img: 'img/2.png',
            about: 'Я скульптор, художник и архитектор. Я вижу красоту в мраморе и отдаю ему всю свою душу, освобождая формы, скрытые внутри.'
        }
    },
    {
        uid: '#0003',
        name: 'Михалыч',
        level: 2,
        role: 'Модератор',
        online: false,

        profile: {
            img: 'img/3.png',
            about: 'Я страстный художник, который выражает свои эмоции через яркие цвета и экспрессивные мазки. Мое искусство - отражение моего внутреннего мира.'
        }
    },
    {
        uid: '#0004',
        name: 'Инакентий',
        level: 77,
        role: 'Игрок',
        online: false,

        profile: {
            img: 'img/4.png',
            about: 'Я импрессионист, который запечатлевает мимолетные моменты времени на холсте. Я хочу передать игру света и тени, запечатлеть красоту природы.'
        }
    },
    {
        uid: '#0005',
        name: 'Глеб',
        level: 50,
        role: 'Игрок',
        online: true,

        profile: {
            img: 'img/5.png',
            about: 'Я авангардист, который ломает традиционные формы. Я исследую кубизм, сюрреализм и другие стили, стремясь выразить суть реальности.'
        }
    },
    {
        uid: '#0006',
        name: 'Валера',
        level: 9,
        role: 'Игрок',
        online: false,

        profile: {
            img: 'img/6.png',
            about: 'Я сюрреалист, который изображает подсознание через странные и фантастические образы. Мое искусство - исследование глубин человеческой психики.'
        }
    },
    {
        uid: '#0007',
        name: 'Захар',
        level: 50,
        role: 'Игрок',
        online: true,

        profile: {
            img: 'img/7.png',
            about: 'Я мастер света и тени. Я использую технику светотени, чтобы передать драму и глубину человеческих эмоций.'
        }
    },
    {
        uid: '#0008',
        name: 'Ксюша',
        level: 1,
        role: 'Игрок',
        online: true,

        profile: {
            img: 'img/8.png',
            about: 'Я мексиканская художница, которая использует автопортреты, чтобы выразить свои страдания, боль и любовь. Мое искусство - отражение моей личной борьбы и культурного наследия.'
        }
    },
    {
        uid: '#0009',
        name: 'Максим',
        level: 99,
        role: 'Модератор',
        online: true,

        profile: {
            img: 'img/9.png',
            about: 'Я фовист, который использует чистые, яркие цвета, чтобы выразить радость и гармонию. Мое искусство стремится создать ощущение легкости и оптимизма.'
        }
    },
    {
        uid: '#0010',
        name: 'Влад',
        level: 3,
        role: 'Игрок',
        online: false,

        profile: {
            img: 'img/10.png',
            about: 'Я абстрактный экспрессионист, который выражает себя через капельное искусство. Я не изображаю реальность, а создаю эмоциональные переживания на холсте.'
        }
    },

],
    profileImg = document.querySelector('.profile-item.user-img'),
    profileName = document.querySelector('.profile-item.user-name'),
    profileLvl = document.querySelector('.profile-item.user-lvl'),
    profileAbout = document.querySelector('.profile-item.user-about'),

    playerListWindow = document.querySelector('.table>ol'),
    btnSortTrigger = document.querySelector('#increasing'),
    btnName = document.querySelector('#abc'),
    btnLvl = document.querySelector('#level'),
    btnOnline = document.querySelector('#online'),
    roleSelect = document.querySelector('.role-select');

let roleName = 'Игрок',
    sortTrigger = true;

getSorteArray(playerList, 'name');

btnSortTrigger.addEventListener('click', () => {
    if (sortTrigger === true)
        sortTrigger = false;
    else
        sortTrigger = true;
    btnSortTrigger.classList.toggle('active');
});

btnName.addEventListener('click', () => {
    getSorteArray(playerList, 'name');
});
btnLvl.addEventListener('click', () => {
    getSorteArray(playerList, 'level')
});
btnOnline.addEventListener('click', () => {
    getSorteArray(playerList, 'online')
});
roleSelect.onchange = function () {
    if (roleSelect.options[roleSelect.selectedIndex].value === 'moder')
        roleName = 'Модератор';

    else
        roleName = 'Игрок';

    getSorteArray(playerList, 'role');
}

function updateUserList() {
    let userList = document.querySelectorAll('.user-list');

    userList.forEach(list => {
        list.addEventListener('click', () => {
            if (list.classList.contains('active')) return;
            if (document.querySelector('.user-list.active') != null)
                document.querySelector('.user-list.active').classList.remove('active');
            list.classList.add('active');

            displayProfile(list.id);
        });
    })
};

//сортировка
function getSorteArray(list, key) {
    let arr = [...list];
    switch (key) {
        case 'level':
            // console.log(`\nОтсортированно по возрастанию по тегу: <${key}>\n`);
            return displayArr(sorteNum(arr, key));

        case 'name':
            // console.log(`\nОтсортированно по алфавиту по тегу: <${key}>\n`);
            return displayArr(sorteAbc(arr, key));

        case 'online': case 'role':
            // console.log(`\nОтсортированно по тегу: <${key}>\n`);
            return displayArr(sorteKey(arr, key));

        default:
            return console.log(`\nНеверный тег: <${key}> | Сортировка невозможна!`);
    }
}

//сортировка чисел по порядку
function sorteNum(arr, key) {
    //понижение
    if (sortTrigger === true)
        arr.sort((a, b) => b[key] - a[key]);

    //повышение
    else
        arr.sort((a, b) => a[key] - b[key]);

    return arr;
}

//сортировка по алфавиту
function sorteAbc(arr, key) {
    //понижение
    if (sortTrigger === true)
        arr.sort((a, b) => b[key].localeCompare(a[key]));

    //повышение
    else
        arr.sort((a, b) => a[key].localeCompare(b[key]));

    return arr;
}

//сортировка по ключу
function sorteKey(arr, key) {
    let newArr = [];
    for (let item in arr) {
        if (key == 'role' && arr[item][key] != roleName)
            continue;
        else if (arr[item][key] == false)
            continue;
        newArr.push(arr[item]);
    }
    return newArr;
}

//Вывод в консоль
function displayArr(arr) {
    playerListWindow.innerHTML = '';
    let roleIcon = '';
    let moderClass = false;
    let onlineIcon = '';

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].role === 'Модератор') {
            roleIcon = '<img class="user-icon" src="icons/moder.svg" alt="">';
            moderClass = true;
        } else {
            roleIcon = '<img class="user-icon" src="icons/user.svg" alt="">';
            moderClass = false
        }

        if (arr[i].online === true)
            onlineIcon = '<span class="user-online"></span>';
        else
            onlineIcon = '';

        let listItem = document.createElement('li');
        listItem.classList.add('user-list');
        listItem.id = arr[i].uid;

        if (moderClass === true)
            listItem.classList.add('moder');

        listItem.innerHTML = `
    <span class="user-index">${`${i + 1}`}</span>
    ${roleIcon}
    <span class="user-name">${arr[i].name}</span>
    <span class="user-lvl">${arr[i].level}</span>
    ${onlineIcon}`
        playerListWindow.appendChild(listItem);
    }

    updateUserList();
}

//отображение профиля
function displayProfile(id) {
    for (let i = 0; i < playerList.length; i++) {
        if (playerList[i].uid == id) {
            profileImg.src = playerList[i].profile.img;
            profileName.innerHTML = playerList[i].name;
            profileLvl.innerHTML = playerList[i].level;
            profileAbout.innerHTML = playerList[i].profile.about;
            return;
        }
    }
}