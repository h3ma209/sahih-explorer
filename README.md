# Sahih Explorer

A modern, interactive web application for exploring Islamic scholars, their academic networks, family trees, and authenticated hadith narrations.

![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **📚 1,940+ Scholar Profiles** with detailed biographies
- **🕸️ Interactive Network Graphs** showing teacher-student relationships
- **👨‍👩‍👧‍👦 Family Tree Visualizations** with genealogical connections
- **📖 Authenticated Hadiths** with complete chain of narrators (Isnad)
- **🌍 Full i18n Support**: English, Arabic (RTL), Kurdish/Sorani
- **🎨 Premium UI** with dark mode and smooth animations
- **🔍 Smart Search** with command palette (⌘K / Ctrl+K)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
sahih-explorer/
├── app/[locale]/          # Internationalized routes
├── components/            # React components
│   ├── features/         # Feature components
│   ├── layout/           # Layout components
│   ├── sections/         # Page sections
│   ├── ui/               # UI primitives (shadcn/ui)
│   └── visualizations/   # Chart components
├── lib/                   # Utilities
├── messages/              # i18n translations (en, ar, ckb)
└── public/data/           # Static JSON data (1,940 scholars)
```

## 🌐 Internationalization

- **English** (`/en`) - Default language
- **Arabic** (`/ar`) - Full RTL support
- **Kurdish/Sorani** (`/ckb`) - Arabic script

Language switcher available in navigation.

## 🗄️ Data

- **1,940 Scholar Profiles** with biographical data
- **Academic Networks**: Teacher-student relationships
- **Family Trees**: Genealogical connections
- **Hadiths**: Authenticated narrations with chains

Data compiled from traditional Islamic sources and biographical dictionaries.

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository to [Vercel](https://vercel.com)
3. Deploy (auto-detected as Next.js)

No environment variables required - all data is static.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Charts**: Apache ECharts
- **i18n**: next-intl
- **Animations**: Framer Motion

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Attribution

Data sources:

- Traditional Islamic biographical dictionaries (Tabaqat)
- Authenticated hadith collections
- Historical academic records
- Wikipedia API for supplementary context

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sahih-explorer/issues)
- **Documentation**: See [PROJECT_ASSESSMENT.md](PROJECT_ASSESSMENT.md)

---

**Built for the preservation and exploration of Islamic scholarship**
