#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// تنفيذ بناء ثابت باستخدام ملف التكوين المنفصل
console.log('Building static version of the site...');
execSync('vite build --config vite.static.config.ts', { stdio: 'inherit' });

// نسخ ملفات API الوهمية للتشغيل الثابت
console.log('Creating mock API data...');

// تأكد من وجود المجلد
const apiDir = path.join('dist', 'public', 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// إنشاء ملف وهمي لبيانات المستخدم
const userMockData = {
  id: 1,
  username: 'viewer',
  role: 'viewer',
  email: 'viewer@example.com'
};
fs.writeFileSync(path.join(apiDir, 'user.json'), JSON.stringify(userMockData));

// إنشاء ملف وهمي لبيانات الوسائط
const mediaMockData = [
  {
    id: 1,
    title: 'تصميم للمتابعين',
    description: 'تصميم خاص أنجز خلال البث',
    mediaType: 'image',
    fileUrl: '/assets/sample-image-1.jpg',
    thumbnailUrl: '/assets/sample-image-1-thumb.jpg',
    year: 2024,
    month: 1,
    views: 120,
    isFeatured: true,
    duration: null,
    uploadDate: new Date().toISOString(),
    uploadedBy: 1
  },
  {
    id: 2,
    title: 'لحظة مميزة من البث',
    description: 'مقطع من البث المباشر',
    mediaType: 'video',
    fileUrl: '/assets/sample-video-1.mp4',
    thumbnailUrl: '/assets/sample-video-1-thumb.jpg',
    year: 2024,
    month: 1,
    views: 85,
    isFeatured: false,
    duration: '00:02:15',
    uploadDate: new Date().toISOString(),
    uploadedBy: 1
  }
];
fs.writeFileSync(path.join(apiDir, 'media.json'), JSON.stringify(mediaMockData));

// إنشاء ملف وهمي لبيانات الداعمين
const supportersMockData = [
  {
    id: 1,
    name: 'أحمد',
    amount: 500,
    currency: 'ريال',
    message: 'استمر في العمل الرائع!',
    year: 2024,
    month: 1,
    rank: 1
  },
  {
    id: 2,
    name: 'سارة',
    amount: 300,
    currency: 'ريال',
    message: 'أحب المحتوى الخاص بك',
    year: 2024,
    month: 1,
    rank: 2
  }
];
fs.writeFileSync(path.join(apiDir, 'supporters.json'), JSON.stringify(supportersMockData));

console.log('Static build completed successfully!');