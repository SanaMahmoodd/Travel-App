// استيراد وحدات Workbox الضرورية
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// التخزين المسبق للملفات التي تم تحديدها بواسطة Workbox في عملية البناء
precacheAndRoute(self.__WB_MANIFEST);

// استراتيجية التخزين المؤقت للصور: استخدام Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // الحد الأقصى لعدد الملفات المخزنة
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يومًا
      }),
    ],
  })
);

// استراتيجية التخزين المؤقت لملفات JavaScript: استخدام Stale While Revalidate
registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'js-cache',
  })
);

// تخطي الانتظار وتفعيل التحديثات الجديدة فورًا
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
