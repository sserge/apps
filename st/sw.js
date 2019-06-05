
/*
Во-первых, нам нужно сообщить работнику сервиса, что нужно кэшировать.
Мы уже создали простой offline page (public/offline.html), который
будет отображаться каждый раз, когда нет сетевого подключения
*/
// CODELAB: Update cache names any time any of the cached files change.
const FILES_TO_CACHE = [
  '/offline.html',
];



// CODELAB: Precache static resources here.
evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
);


/*=================================*/
/* Очистить старые офлайн-страницы */
/*=================================*/
/*
Мы будем использовать событие activate для очистки любых старых данных в нашем кеше.
Этот код гарантирует, что ваш сервисный работник обновляет свой кэш всякий раз,
когда изменяется какой-либо из файлов оболочки приложения.
Чтобы это работало, вам нужно CACHE_NAME переменную CACHE_NAME в верхней части файла рабочего сервиса.
*/
// CODELAB: Remove previous cached data from disk.
evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
);



