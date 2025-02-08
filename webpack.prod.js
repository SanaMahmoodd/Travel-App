import { merge } from 'webpack-merge';
import common from './webpack.config.js';
import { InjectManifest } from 'workbox-webpack-plugin';

export default merge(common, {
  mode: 'production',
  plugins: [
    new InjectManifest({
      swSrc: './src/client/sw.js', // مسار ملف Service Worker المخصص
      swDest: 'service-worker.js', // اسم ملف Service Worker الناتج
    }),
  ],
});