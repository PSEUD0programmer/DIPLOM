const slideBtn = document.querySelectorAll('.nav-btn, .tools-container-btn');

slideBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        slideContent(btn);
    })
});

function slideContent(btn) {
    let contentClassName = btn.className.split(" ").pop();
    if (contentClassName === 'active') return;

    let contentOn = document.querySelector('.' + btn.id),
        contentOff = document.querySelectorAll('.' + contentOn.className.split(" ").shift());
    

    document.querySelector('.' + contentClassName + '.active').classList.remove("active");
    btn.classList.add("active");

    contentOff.forEach(content => {
        content.style.display = 'none';
    })

    contentOn.removeAttribute("style");
}