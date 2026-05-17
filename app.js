// 1. Инициализируем Telegram WebApp SDK
const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово к отображению и можно убрать шторку загрузки
tg.ready();
tg.expand(); // Разворачиваем приложение на максимум вверх для удобства

// Сюда вставьте URL вашего задеплоенного бэкенда на Railway (БЕЗ косой черты на конце)
const BACKEND_URL = "https://lalagramm-production.up.railway.app"; 

// 2. Имитируем получение ID заказа.
// Когда ваше приложение разрастется, вы будете передавать ID заказа прямо в ссылке,
// например: https://.../index.html?order_id=45. Пока для теста укажем ID вручную.
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('order_id') || 1; // Если в ссылке нет id, тестируем на заказе №1

// Находим элементы на странице, с которыми будем работать
const loaderEl = document.getElementById('loader');
const containerEl = document.getElementById('invoice-container');
const instructionsEl = document.getElementById('instructions');
const paidBtn = document.getElementById('paid-button');

// 3. Функция, которая делает запрос к вашему FastAPI бэкенду
async function loadInvoice() {
    // Показываем лоадер, прячем контейнер
    loaderEl.style.display = 'block';
    containerEl.style.style = 'none';

    try {
        // Делаем GET-запрос к эндпоинту, который мы вчера починили
        const response = await fetch(`${BACKEND_URL}/api/v1/orders/${orderId}/invoice`);
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json(); // Превращаем ответ сервера в понятный JS-объект

        // Берем текст инструкции из JSON ответа бэкенда и вставляем в HTML
        instructionsEl.textContent = data.instructions;

        // Прячем лоадер и показываем готовый счет пользователю
        loaderEl.style.display = 'none';
        containerEl.style.display = 'block';

    } catch (error) {
        // Если сервер упал или интернета нет
        loaderEl.textContent = `❌ Не удалось загрузить счет: ${error.message}`;
        console.error(error);
    }
}

// 4. Обработка нажатия на кнопку "Я оплатил"
paidBtn.addEventListener('click', () => {
    // Показываем нативное всплывающее окно самого Telegram
    tg.showPopup({
        title: 'Заявка принята',
        message: 'Спасибо! Администратор проверит перевод и подтвердит ваш заказ в чате.',
        buttons: [{type: 'ok'}]
    }, function() {
        // Когда пользователь закроет уведомление, мы автоматически закроем Mini App
        tg.close();
    });
});

// Запускаем загрузку данных сразу при открытии страницы
loadInvoice();
