// Основной JavaScript файл для BPM Centr

document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Боковое меню (сворачивание/разворачивание)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarCol = document.getElementById('sidebar-col');
    const dashboardContainer = document.getElementById('dashboard-container');

    // Функция для обновления состояния меню
    function updateSidebarState(collapsed) {
        if (collapsed) {
            sidebar.classList.add('collapsed');
            if (sidebarCol) sidebarCol.classList.add('collapsed');
            if (dashboardContainer) dashboardContainer.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('collapsed');
            if (sidebarCol) sidebarCol.classList.remove('collapsed');
            if (dashboardContainer) dashboardContainer.classList.remove('sidebar-collapsed');
        }

        // Сохраняем состояние в localStorage
        localStorage.setItem('sidebarCollapsed', collapsed);
    }

    // Проверяем, сохранено ли состояние меню в localStorage
    if (sidebar && localStorage.getItem('sidebarCollapsed') === 'true') {
        updateSidebarState(true);
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            const isCollapsed = !sidebar.classList.contains('collapsed');
            updateSidebarState(isCollapsed);
        });
    }

    // Выпадающее меню пользователя перенесено в отдельный файл user-dropdown.js

    // Табы на странице детального описания коннектора
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length && tabContents.length) {
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // Удаляем активный класс у всех табов
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Добавляем активный класс выбранному табу
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Фильтры на странице коннекторов
    const filterSelects = document.querySelectorAll('.filter-select');

    if (filterSelects.length) {
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                // Здесь будет логика фильтрации
                console.log('Фильтр изменен:', this.value);
                // В реальном приложении здесь будет AJAX-запрос или другая логика фильтрации
            });
        });
    }

    // Поиск на странице коннекторов
    const searchInput = document.querySelector('#connector-search');
    const searchButton = document.querySelector('#search-button');

    // Функция выполнения поиска
    function performSearch() {
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            // Здесь будет логика поиска
            console.log('Выполняется поиск:', searchQuery);
            // В реальном приложении здесь будет AJAX-запрос или другая логика поиска

            // Пример имитации поиска (в реальном приложении заменить на настоящий поиск)
            alert('Выполняется поиск: ' + searchQuery);
        }
    }

    if (searchInput && searchButton) {
        // Обработка клика по кнопке поиска
        searchButton.addEventListener('click', function() {
            performSearch();
        });

        // Обработка нажатия Enter в поле поиска
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Предотвращаем отправку формы
                performSearch();
            }
        });
    }

    // Модальные окна
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloseButtons = document.querySelectorAll('.modal-close');

    if (modalTriggers.length) {
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    if (modalCloseButtons.length) {
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // Закрытие модального окна при клике вне его
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
