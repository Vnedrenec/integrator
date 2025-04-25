// Функция для инициализации выпадающего меню пользователя
function initUserDropdown() {
    // Проверяем, авторизован ли пользователь (наличие элемента с классом user-dropdown-toggle)
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');

    if (!userDropdownToggle) {
        return; // Если элемент не найден, выходим из функции
    }

    // Создаем выпадающее меню, если его еще нет
    let userDropdownMenu = document.querySelector('.user-dropdown-menu');

    if (!userDropdownMenu) {
        userDropdownMenu = document.createElement('div');
        userDropdownMenu.className = 'user-dropdown-menu';
        userDropdownMenu.innerHTML = `
            <ul>
                <li><a href="dashboard.html">Личный кабинет</a></li>
                <li><a href="user-profile.html">Профиль</a></li>
                <li><a href="user-api-keys.html">API-ключи</a></li>
                <li><a href="user-subscriptions.html">Подписки</a></li>
                <li><a href="../index.html">Выйти</a></li>
            </ul>
        `;
        userDropdownToggle.parentNode.appendChild(userDropdownMenu);
    }

    // Добавляем обработчик клика для переключения меню
    userDropdownToggle.addEventListener('click', function(e) {
        e.preventDefault();
        // Переключаем класс active как для меню, так и для кнопки
        userDropdownMenu.classList.toggle('active');
        userDropdownToggle.classList.toggle('active');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userDropdownMenu.classList.remove('active');
            userDropdownToggle.classList.remove('active');
        }
    });

    // Закрытие меню при клике на пункт меню
    userDropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            userDropdownMenu.classList.remove('active');
            userDropdownToggle.classList.remove('active');
        });
    });
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', initUserDropdown);
