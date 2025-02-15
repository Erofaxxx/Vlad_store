// Глобальные переменные

let cart = [];

const products = [
    {
        id: 1,
        name: 'AirPods Pro',
        price: 19990,
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985',
        link: 'airpods-pro.html'
    },
    {
        id: 2,
        name: 'MagSafe Charger',
        price: 4990,
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MHXH3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1661269972367',
        link: 'magsafe-charger.html'
    },
    {
        id: 3,
        name: 'Apple Watch Band',
        price: 5990,
        image: 'https://github.com/Erofaxxx/Vlad_store/blob/main/chehol.jpeg?raw=true',
        link: 'apple-watch-band.html'
    }
];

// Инициализация корзины
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartCount();
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление счетчика корзины
function updateCartCount() {
    const countElements = document.querySelectorAll('#cartCount');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElements.forEach(el => el.textContent = total);
}

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showNotification(`${product.name} добавлен в корзину`);
}

// Показ уведомлений
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Функция рендеринга товаров
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = ''; // Очищаем контейнер перед рендером

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="${product.link}">
                <img src="${product.image}" class="product-image" alt="${product.name}">
            </a>
                <h3>${product.name}</h3>
                <p>${product.price.toLocaleString()} ₽</p>
            
            <button onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    renderProducts(); // Вызываем рендер товаров
});







// Функция отправки данных в Telegram
async function sendToTelegram(orderData) {
    const botToken = '7871106121:AAGVfUJMm6s4RK0kTYJSoMh6ejw5J5BKLnE'; // Замените на токен вашего бота
    const chatIds = ['790984069', '1184550715']; // Ваш chat_id и chat_id вашего друга

    // Формируем текст сообщения
    const message = `
        Новый заказ! 🛍️
        Телефон: ${orderData.phone}
        Telegram: ${orderData.telegram}
        Адрес: ${orderData.address || 'Не указан'}
        Товары:
        ${orderData.cart.map(item => `- ${item.name} (${item.quantity} шт.)`).join('\n')}
        Итого: ${orderData.total.toLocaleString()} ₽
    `;

    // Отправляем сообщение всем указанным chat_id
    try {
        const sendPromises = chatIds.map(chatId => {
            return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                }),
            });
        });

        // Ждём завершения всех запросов
        const results = await Promise.all(sendPromises);

        // Проверяем, все ли запросы успешны
        const allSuccess = results.every(response => response.ok);
        return allSuccess;
    } catch (error) {
        console.error('Ошибка:', error);
        return false;
    }
}