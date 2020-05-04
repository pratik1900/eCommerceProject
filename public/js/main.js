const navLink = document.querySelector('.nav .nav-link');

const makeActiveClass = () => {
  navLink.classList.add('active');
}

navLink.parentElement.addEventListener('click', makeActiveClass);