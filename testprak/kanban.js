/**
 * Функция для перемещения задачи в нужную колонку.
 * @param {HTMLElement} taskElement - DOM-элемент самой задачи (стикер)
 * @param {string} columnName - Название колонки ('Очередь', 'В работе', 'Проверка', 'Готово')
 */
function moveTask(taskElement, columnName) {
    if (!taskElement) {
        console.error("Ошибка: HTML-элемент задачи не передан!");
        return;
    }

    // Ищем контейнер для задач внутри нужной колонки по data-col
    const targetColumn = document.querySelector(`.kanban-column[data-col="${columnName}"] .kanban-tasks`);
    
    if (targetColumn) {
        // Перемещаем элемент (appendChild автоматически уберет его из старого места)
        targetColumn.appendChild(taskElement);
        
        // Опционально: обновляем счетчики задач в колонках
        updateCounters();
    } else {
        console.error(`Ошибка: Колонка с названием "${columnName}" не найдена!`);
    }
}

/**
 * Вспомогательная функция для обновления счетчиков задач
 */
function updateCounters() {
    document.querySelectorAll('.kanban-column').forEach(column => {
        const count = column.querySelectorAll('.kanban-task').length;
        column.querySelector('.task-count').textContent = count;
    });
}

// ==========================================
// ТЕСТОВЫЙ ЗАПУСК (Раскомментируй, чтобы проверить)
// ==========================================
/*
setTimeout(() => {
    const myTask = document.getElementById('task-1');
    moveTask(myTask, 'В работе');
}, 2000); // Через 2 секунды задача прыгнет в колонку "В работе"

setTimeout(() => {
    const myTask = document.getElementById('task-1');
    moveTask(myTask, 'Проверка');
}, 4000); // Через 4 секунды задача прыгнет в колонку "Проверка"
*/