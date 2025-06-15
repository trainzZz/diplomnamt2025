const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const path = require('path');

// Firebase Admin SDK
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Инициализация Firebase Admin SDK
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      })
    });
  }
} catch (error) {
  console.error("Ошибка инициализации Firebase Admin SDK:", error);
  process.exit(1); // Завершаем процесс, так как без Firebase сервер не имеет смысла
}

const db = getFirestore();

const app = express();

// Инициализация бота Telegram с обработкой ошибок
let bot;
const initializeBot = () => {
  try {
    bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { 
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

    // Обработка ошибок бота
    bot.on('polling_error', (error) => {
      console.error('Ошибка polling:', error.message);
      if (error.message.includes('409 Conflict')) {
        console.log('Перезапуск бота...');
        setTimeout(() => {
          bot.stopPolling();
          initializeBot();
        }, 5000);
      }
    });

    // Обработка ошибок соединения
    bot.on('webhook_error', (error) => {
      console.error('Ошибка webhook:', error);
    });

    // Обработка ошибок при отправке сообщений
    bot.on('error', (error) => {
      console.error('Ошибка бота:', error);
    });

    console.log('Telegram бот успешно инициализирован');
  } catch (error) {
    console.error('Ошибка при инициализации бота:', error);
    setTimeout(initializeBot, 5000);
  }
};

initializeBot();

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов из папки 'build'
// Предполагается, что telegramServer.js находится в src/server,
// а папка build - в корне проекта, т.е. на два уровня выше, потом в build
app.use(express.static(path.join(__dirname, '../../build')));

// Хранилище для кодов верификации (если используется)
const verificationCodes = new Map();

// API endpoint для генерации кода (если используется)
app.post('/api/generate-code', (req, res) => {
    const { userId } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(code, { userId, timestamp: Date.now(), verified: false });
    console.log('Сгенерирован код:', code, 'для userId:', userId);
    setTimeout(() => {
        if (verificationCodes.has(code) && !verificationCodes.get(code).verified) {
            verificationCodes.delete(code);
            console.log('Код', code, 'истек и удален (не был верифицирован)');
        }
    }, 5 * 60 * 1000);
    res.json({ code });
});

// API endpoint для проверки кода (если используется)
app.post('/api/verify-code', (req, res) => {
    const { code } = req.body;
    const verification = verificationCodes.get(code);
    if (!verification) {
        return res.status(400).json({ error: 'Неверный код' });
    }
    if (verification.verified) {
        verificationCodes.delete(code);
        return res.json({
            verified: true,
            userId: verification.userId,
            telegramUserId: verification.telegramUserId
        });
    } else if (Date.now() - verification.timestamp > 5 * 60 * 1000){
        verificationCodes.delete(code);
        return res.status(400).json({ error: 'Код истек' });
    } else {
        return res.json({ verified: false });
    }
});

// Fallback для всех остальных GET-запросов, чтобы React Router мог их обработать
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// Функция для получения посылок пользователя
const getUserPackages = async (userId) => {
  try {
    const packagesSnapshot = await db.collection('packages')
      .where('userId', '==', userId)
      .get();
    
    return packagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Ошибка при получении посылок:', error);
    throw error;
  }
};

// Функция для форматирования карточки посылки
const formatPackageCard = (package) => {
  return `
📦 Посылка #${package.trackingNumber}

🚚 Статус: ${formatStatus(package.status)}
${package.description ? `📝 Описание: ${package.description}` : ''}
${package.weight ? `\n⚖️ Вес: ${package.weight} кг` : ''}
${package.dimensions ? `📏 Размеры: ${package.dimensions}` : ''}
  `.trim();
};

// Функция для форматирования данных пользователя
const formatUserProfile = (userData) => {
  // Корректная обработка даты
  let regDate = 'Не указана';
  if (userData.createdAt) {
    try {
      // Firestore Timestamp может быть объектом с методом toDate
      if (typeof userData.createdAt === 'object' && userData.createdAt.toDate) {
        regDate = userData.createdAt.toDate().toLocaleDateString('ru-RU');
      } else if (typeof userData.createdAt === 'string' || typeof userData.createdAt === 'number') {
        regDate = new Date(userData.createdAt).toLocaleDateString('ru-RU');
      }
    } catch (e) {
      regDate = 'Ошибка даты';
    }
  }
  return `
👤 Мой кабинет

🧑 ФИО: ${userData.fullName || 'Не указано'}
📧 Email: ${userData.email || 'Не указан'}

📱 Телефон: ${userData.phone || 'Не указан'}
🏠 Адрес: ${userData.address || 'Не указан'}

📅 Дата регистрации: ${regDate}
📦 Количество отслеживаемых посылок: ${userData.packagesCount || 0}
  `.trim();
};

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Проверяем, есть ли пользователь в базе
        const usersSnapshot = await db.collection('users')
            .where('telegramUserId', '==', chatId)
            .get();

        if (usersSnapshot.empty) {
            bot.sendMessage(chatId, 'Вы еще не подключили свой аккаунт. Пожалуйста, сделайте это на сайте.');
            return;
        }

        const keyboard = {
            reply_markup: {
                keyboard: [
                    [{ text: '📦 Мои посылки' }, { text: '👤 Мой кабинет' }]
                ],
                resize_keyboard: true
            }
        };
        bot.sendMessage(chatId, 'Добро пожаловать! Выберите действие:', keyboard);
    } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при проверке вашего аккаунта. Пожалуйста, попробуйте позже.');
    }
});

// Хранилище для текущих просматриваемых посылок пользователей
const userPackageViews = new Map();

// Обработчик текстовых сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    
    if (!text) return;

    if (text === '👤 Мой кабинет') {
        try {
            // Получаем данные пользователя
            const usersSnapshot = await db.collection('users')
                .where('telegramUserId', '==', chatId)
                .get();

            if (usersSnapshot.empty) {
                bot.sendMessage(chatId, 'Вы еще не подключили свой аккаунт. Пожалуйста, сделайте это на сайте.');
                return;
            }

            const userData = usersSnapshot.docs[0].data();
            
            // Получаем количество посылок пользователя
            const packagesSnapshot = await db.collection('packages')
                .where('userId', '==', usersSnapshot.docs[0].id)
                .get();
            
            userData.packagesCount = packagesSnapshot.size;

            // Отправляем профиль пользователя
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📦 Мои посылки', callback_data: 'show_packages' }
                        ]
                    ]
                }
            };

            await bot.sendMessage(chatId, formatUserProfile(userData), keyboard);
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            bot.sendMessage(chatId, 'Произошла ошибка при получении данных профиля.');
        }
    } else if (text === '📦 Мои посылки') {
        try {
            // Получаем userId из базы данных по telegramUserId
            const usersSnapshot = await db.collection('users')
                .where('telegramUserId', '==', chatId)
                .get();

            if (usersSnapshot.empty) {
                bot.sendMessage(chatId, 'Вы еще не подключили свой аккаунт. Пожалуйста, сделайте это на сайте.');
                return;
            }

            const userId = usersSnapshot.docs[0].id;
            const packages = await getUserPackages(userId);

            if (packages.length === 0) {
                bot.sendMessage(chatId, 'У вас пока нет отслеживаемых посылок.');
                return;
            }

            // Сохраняем информацию о просмотре
            userPackageViews.set(chatId, {
                packages,
                currentIndex: 0
            });

            // Отправляем первую посылку с кнопками навигации
            await sendPackageWithNavigation(chatId, 0);
        } catch (error) {
            console.error('Ошибка при получении посылок:', error);
            bot.sendMessage(chatId, 'Произошла ошибка при получении списка посылок.');
        }
    } else if (text === '⬅️ Предыдущая' || text === 'Следующая ➡️') {
        const view = userPackageViews.get(chatId);
        if (!view) {
            bot.sendMessage(chatId, 'Пожалуйста, сначала выберите "Мои посылки"');
            return;
        }

        const newIndex = text === '⬅️ Предыдущая' 
            ? (view.currentIndex - 1 + view.packages.length) % view.packages.length
            : (view.currentIndex + 1) % view.packages.length;

        view.currentIndex = newIndex;
        await sendPackageWithNavigation(chatId, newIndex);
    } else if (!text.startsWith('/') && /^\d{6}$/.test(text)) {
        // Существующая логика проверки кода
        if (verificationCodes.has(text)) {
            const verification = verificationCodes.get(text);
            if (Date.now() - verification.timestamp > 5 * 60 * 1000) {
                bot.sendMessage(chatId, 'Срок действия этого кода истек. Пожалуйста, сгенерируйте новый код на сайте.');
                verificationCodes.delete(text);
            } else {
                verification.verified = true;
                verification.telegramUserId = chatId;
                bot.sendMessage(chatId, 'Код подтвержден!');
                
                // После подтверждения кода автоматически показываем посылки
                try {
                    const userId = verification.userId;
                    const packages = await getUserPackages(userId);

                    if (packages.length === 0) {
                        bot.sendMessage(chatId, 'У вас пока нет отслеживаемых посылок.');
                        // Добавляем кнопки после сообщения об отсутствии посылок
                        const keyboard = {
                            reply_markup: {
                                keyboard: [
                                    [{ text: '📦 Мои посылки' }, { text: '👤 Мой кабинет' }]
                                ],
                                resize_keyboard: true
                            }
                        };
                        bot.sendMessage(chatId, 'Выберите действие:', keyboard);
                        return;
                    }

                    // Сохраняем информацию о просмотре
                    userPackageViews.set(chatId, {
                        packages,
                        currentIndex: 0
                    });

                    // Отправляем первую посылку с кнопками навигации
                    await sendPackageWithNavigation(chatId, 0);
                    
                    // Добавляем кнопки после показа посылок
                    const keyboard = {
                        reply_markup: {
                            keyboard: [
                                [{ text: '📦 Мои посылки' }, { text: '👤 Мой кабинет' }]
                            ],
                            resize_keyboard: true
                        }
                    };
                    bot.sendMessage(chatId, 'Выберите действие:', keyboard);
                } catch (error) {
                    console.error('Ошибка при получении посылок после подтверждения кода:', error);
                    bot.sendMessage(chatId, 'Произошла ошибка при получении списка посылок.');
                    // Добавляем кнопки даже в случае ошибки
                    const keyboard = {
                        reply_markup: {
                            keyboard: [
                                [{ text: '📦 Мои посылки' }, { text: '👤 Мой кабинет' }]
                            ],
                            resize_keyboard: true
                        }
                    };
                    bot.sendMessage(chatId, 'Выберите действие:', keyboard);
                }
            }
        } else {
            bot.sendMessage(chatId, 'Неверный или истекший код. Пожалуйста, проверьте код и попробуйте снова, или сгенерируйте новый на сайте.');
        }
    }
});

// Функция для отправки посылки с кнопками навигации
async function sendPackageWithNavigation(chatId, index, messageId = null) {
    const view = userPackageViews.get(chatId);
    if (!view || !view.packages || view.packages.length === 0) {
        if (messageId) {
            await bot.editMessageText('У вас пока нет отслеживаемых посылок.', {
                chat_id: chatId,
                message_id: messageId
            });
        } else {
            await bot.sendMessage(chatId, 'У вас пока нет отслеживаемых посылок.');
        }
        userPackageViews.delete(chatId);
        return;
    }

    const package = view.packages[index];
    const notificationsEnabled = package.telegramNotifications && package.telegramNotifications.enabled;
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️ Предыдущая', callback_data: 'prev' },
                    { text: `${index + 1}/${view.packages.length}`, callback_data: 'count' },
                    { text: 'Следующая ➡️', callback_data: 'next' }
                ],
                [
                    { text: notificationsEnabled ? '🔕 Отключить уведомления' : '🔔 Включить уведомления', callback_data: `toggle_notifications:${package.id}` },
                ],
                [
                    { text: '👤 Мой кабинет', callback_data: 'show_profile' }
                ]
            ]
        }
    };

    try {
        if (messageId) {
            await bot.editMessageText(formatPackageCard(package), {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: keyboard.reply_markup
            });
        } else {
            const sentMessage = await bot.sendMessage(chatId, formatPackageCard(package), keyboard);
            view.messageId = sentMessage.message_id;
        }
    } catch (error) {
        console.error('Ошибка при отправке/редактировании сообщения:', error);
        if (!messageId) {
            await bot.sendMessage(chatId, 'Произошла ошибка при отображении посылки. Пожалуйста, попробуйте снова.');
        }
    }
}

// Обработчик callback-запросов от inline-кнопок
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const view = userPackageViews.get(chatId);
    
    if (callbackQuery.data === 'show_packages') {
        try {
            // Получаем userId из базы данных по telegramUserId
            const usersSnapshot = await db.collection('users')
                .where('telegramUserId', '==', chatId)
                .get();

            if (usersSnapshot.empty) {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Вы еще не подключили свой аккаунт',
                    show_alert: true
                });
                return;
            }

            const userId = usersSnapshot.docs[0].id;
            const packages = await getUserPackages(userId);

            if (packages.length === 0) {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'У вас пока нет отслеживаемых посылок',
                    show_alert: true
                });
                return;
            }

            // Сохраняем информацию о просмотре
            userPackageViews.set(chatId, {
                packages,
                currentIndex: 0
            });

            // Отправляем первую посылку с кнопками навигации
            await sendPackageWithNavigation(chatId, 0);
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        } catch (error) {
            console.error('Ошибка при получении посылок:', error);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Произошла ошибка при получении списка посылок',
                show_alert: true
            });
            return;
        }
    }
    
    if (callbackQuery.data === 'show_profile') {
        try {
            const usersSnapshot = await db.collection('users')
                .where('telegramUserId', '==', chatId)
                .get();
            if (usersSnapshot.empty) {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Вы еще не подключили свой аккаунт',
                    show_alert: true
                });
                return;
            }
            const userData = usersSnapshot.docs[0].data();
            const packagesSnapshot = await db.collection('packages')
                .where('userId', '==', usersSnapshot.docs[0].id)
                .get();
            userData.packagesCount = packagesSnapshot.size;
            await bot.sendMessage(chatId, formatUserProfile(userData));
            await bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Ошибка при получении профиля',
                show_alert: true
            });
        }
        return;
    }
    
    if (!view || !view.packages || view.packages.length === 0) {
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Список посылок пуст или устарел. Пожалуйста, обновите список.',
            show_alert: true
        });
        return;
    }

    let newIndex = view.currentIndex;
    
    if (callbackQuery.data.startsWith('toggle_notifications:')) {
        const packageId = callbackQuery.data.split(':')[1];
        const package = view.packages[view.currentIndex];
        // Получаем текущий статус из telegramNotifications.enabled
        const currentEnabled = package.telegramNotifications && package.telegramNotifications.enabled;
        const newEnabled = !currentEnabled;
        
        try {
            // Обновляем telegramNotifications.enabled в Firestore
            await db.collection('packages').doc(packageId).update({
                'telegramNotifications.enabled': newEnabled
            });
            
            // Обновляем локальное состояние
            if (!package.telegramNotifications) package.telegramNotifications = {};
            package.telegramNotifications.enabled = newEnabled;
            
            // Обновляем сообщение
            await sendPackageWithNavigation(chatId, view.currentIndex, messageId);
            
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: newEnabled ? 'Уведомления включены' : 'Уведомления отключены'
            });
        } catch (error) {
            console.error('Ошибка при обновлении статуса уведомлений:', error);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Произошла ошибка при обновлении статуса уведомлений',
                show_alert: true
            });
        }
        return;
    }
    
    switch (callbackQuery.data) {
        case 'prev':
            newIndex = (view.currentIndex - 1 + view.packages.length) % view.packages.length;
            break;
        case 'next':
            newIndex = (view.currentIndex + 1) % view.packages.length;
            break;
        case 'count':
            // Просто обновляем сообщение с тем же индексом
            break;
    }

    view.currentIndex = newIndex;
    await sendPackageWithNavigation(chatId, newIndex, messageId);
    await bot.answerCallbackQuery(callbackQuery.id);
});

// Функция для форматирования статуса (остается без изменений)
const formatStatus = (status) => {
  if (!status) return 'Неизвестно';
  switch (status.toLowerCase()) {
    case 'created': return 'Создана';
    case 'in_transit': return 'В пути';
    case 'ready': return 'Готова к получению';
    case 'cancelled': return 'Отменена';
    case 'pending': return 'Зарегистрирована';
    case 'registered': return 'Зарегистрирована';
    case 'delivered': return 'Доставлена';
    case 'returned': return 'Возвращена';
    default: return status;
  }
};

// Функция для отправки уведомления о смене статуса посылки
const sendPackageStatusNotification = async (packageId, newStatus) => {
  try {
    const packageRef = db.collection('packages').doc(packageId);
    const packageDocSnap = await packageRef.get();
    
    if (!packageDocSnap.exists) {
      console.error('Посылка не найдена:', packageId);
      return;
    }

    const packageData = packageDocSnap.data();
    
    const userRef = db.collection('users').doc(packageData.userId);
    const userDocSnap = await userRef.get();
    
    if (!userDocSnap.exists || !userDocSnap.data().telegramConnected) {
      console.log('Пользователь не найден или не подключил Telegram:', packageData.userId);
      return;
    }

    const userData = userDocSnap.data();
    const telegramUserId = userData.telegramUserId;

    const statusText = formatStatus(newStatus);
    const message = `
📦 Обновление статуса посылки

Трек-номер: ${packageData.trackingNumber}
Новый статус: ${statusText}
${packageData.description ? `Описание: ${packageData.description}` : ''}
${packageData.weight ? `Вес: ${packageData.weight} кг` : ''}
${packageData.dimensions ? `Размеры: ${packageData.dimensions}` : ''}
Дата обновления: ${new Date().toLocaleDateString('ru-RU')}
    `.trim();

    await bot.sendMessage(telegramUserId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    console.log('Уведомление отправлено (через Admin SDK):', { packageId, userId: packageData.userId, telegramUserId, status: newStatus });

  } catch (error) {
    console.error('Ошибка при отправке уведомления (Admin SDK):', error);
    throw error;
  }
};

// API endpoint для отправки уведомлений при изменении статуса
app.post('/api/notify-status-change', async (req, res) => {
  try {
    const { packageId, newStatus } = req.body;
    if (!packageId || !newStatus) {
      return res.status(400).json({ error: 'Необходимо указать packageId и newStatus' });
    }
    await sendPackageStatusNotification(packageId, newStatus);
    res.json({ success: true, message: 'Уведомление поставлено в очередь на отправку' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка на сервере при отправке уведомления',
      details: error.message 
    });
  }
});


// Запуск сервера
app.listen(config.SERVER_PORT, () => {
  console.log(`Сервер Telegram уведомлений запущен на порту ${config.SERVER_PORT} с использованием Firebase Admin SDK`);
});

// Экспортируем функции (если они нужны где-то еще, хотя для telegramServer это обычно не требуется)
module.exports = {
  // app, // Обычно не экспортируют app целиком
  // sendPackageStatusNotification // Эта функция теперь вызывается через API endpoint
}; 