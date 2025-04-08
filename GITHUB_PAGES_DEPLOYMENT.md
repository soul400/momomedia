# دليل نشر الموقع على GitHub Pages

هذا الملف يشرح كيفية نشر موقع "بثوث المهره" على GitHub Pages.

## خطوات الاستضافة

### 1. تجهيز المستودع

1. قم بإنشاء مستودع جديد على GitHub باسم `buthooth-almahrah`
2. قم بتنزيل هذا المشروع من Replit كملف مضغوط 
3. استخرج الملفات وقم برفعها إلى المستودع الجديد

### 2. تعديل ملف package.json

أضف هذه السكريبتات إلى ملف package.json:

```json
"scripts": {
  "dev": "tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "build:static": "vite build --config vite.static.config.ts",
  "predeploy": "npm run build:static",
  "deploy": "gh-pages -d dist/public",
  "start": "NODE_ENV=production node dist/index.js"
}
```

### 3. تكوين GitHub Actions

1. تأكد من وجود مجلد `.github/workflows` في مشروعك
2. أنشئ ملف `deploy.yml` في هذا المجلد:

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Build static site
        run: npm run build:static
        
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist/public
          branch: gh-pages
```

### 4. الاستضافة يدوياً

يمكنك أيضًا نشر الموقع يدويًا عن طريق:

1. قم بتثبيت الاعتماديات: 
   ```
   npm install
   ```

2. قم ببناء الموقع: 
   ```
   npm run build:static
   ```

3. قم بنشر الموقع: 
   ```
   npm run deploy
   ```

### 5. تكوين GitHub Pages

1. انتقل إلى إعدادات مستودع GitHub الخاص بك
2. اذهب إلى قسم "Pages"
3. اختر فرع "gh-pages" كمصدر للنشر
4. انقر على "Save"

يجب أن يكون موقعك متاحًا الآن على:
`https://[your-username].github.io/buthooth-almahrah/`

## ملاحظات هامة

- تأكد من تحديث قيمة `base` في ملف `vite.static.config.ts` لتطابق اسم المستودع الخاص بك
- الإصدار الثابت سيستخدم بيانات وهمية مُضمّنة، ولا يحتاج إلى خادم API
- لإضافة محتوى جديد، يجب عليك تحديث البيانات في ملف `static-build.mjs`

## تخصيص المجال

إذا كنت ترغب في استخدام اسم مجال مخصص:

1. أضف ملف `CNAME` في مجلد `public` يحتوي على اسم المجال الخاص بك
2. قم بتكوين سجلات DNS الخاصة بك لتشير إلى خوادم GitHub Pages
3. اتبع تعليمات GitHub لإعداد مجال مخصص في قسم Pages من إعدادات المستودع