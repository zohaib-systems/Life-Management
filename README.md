# 📊 Life Management OS

> Track Goals • Build Habits • Manage Wealth

A comprehensive, privacy-first life management dashboard to help you achieve financial freedom and personal growth. Track your goals, build sustainable habits, manage expenses, and monitor your net worth—all in one beautiful, responsive interface.

[![PageSpeed: 100%](https://img.shields.io/badge/PageSpeed-100%25-success)](https://pagespeed.web.dev/)
[![Accessibility: 100%](https://img.shields.io/badge/Accessibility-100%25-success)](https://www.w3.org/WAI/WCAG2AAA-Conformance)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🎯 Goal Management
- **One Page Plan**: Set long-term, mid-term, and short-term goals
- **Live Goal Timer**: Real-time countdown to your deadlines
- **Goal Dashboard**: Visual overview of all your goals and linked habits

### 💪 Habit Tracking
- **Sequential Habit Chain**: Progressive 21-90-365 day habit building system
- **Goal Linking**: Connect habits to your specific goals
- **Daily Check-ins**: Simple ✓/✗ system to track daily progress
- **Automatic Progression**: Habits advance through stages automatically

### 💰 Financial Management
- **Expense Tracker**: Monitor daily spending
- **Income & Assets**: Track all income sources and assets
- **Debt Management**: Keep tabs on liabilities
- **Net Worth Calculator**: Real-time wealth calculation
- **Wealth Level System**: 5-level progression from struggle to tycoon

### 📅 Deadline Management
- **Live Timers**: Real-time countdown for all deadlines
- **Multiple Deadlines**: Track as many as needed
- **Visual Alerts**: See what's coming up next

### 🎓 Skills Development
- **Skill Tracker**: Monitor technical, soft, language, and tool skills
- **Progress Tracking**: Visual progress bars with percentages
- **Smart Suggestions**: Context-aware improvement recommendations
- **Notes System**: Track learning milestones and next steps

### 🔐 Privacy First
- **Local Storage Only**: All data stays on your device
- **PIN Protection**: Secure your data with a PIN
- **No Cloud Sync**: Complete privacy, no data collection
- **Export/Import**: Backup and restore your data anytime

## 🚀 Quick Start

### Online (Recommended)
Visit: **[https://zohaib-systems.github.io/Life-Management/](https://zohaib-systems.github.io/Life-Management/)**

### Local Development
```bash
# Clone the repository
git clone https://github.com/zohaib-systems/Life-Management.git
cd Life-Management

# Open in browser (no build step required!)
# Option 1: Direct file
open index.html

# Option 2: Local server
python3 -m http.server 8080
# Visit http://localhost:8080
```

## 📱 Compatibility

### Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ All modern mobile browsers

### Devices
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)
- ✅ Works offline once loaded

## 🎨 Screenshots

### Desktop Dashboard
![Desktop View](https://github.com/user-attachments/assets/4655371e-64c5-4ce4-bfe3-85ad53a3d1b4)

### Mobile Responsive
![Mobile View](https://github.com/user-attachments/assets/9a877fe6-8c55-497a-a947-9f09aeeaeaad)

### Tablet Layout
![Tablet View](https://github.com/user-attachments/assets/949a93b6-8586-449a-8210-2bd61666e8da)

## 🏗️ Architecture

```
Life-Management/
├── index.html          # Main HTML structure
├── index.css           # Responsive styles with animations
├── index.js            # Application logic
├── manifest.json       # PWA manifest
├── robots.txt          # SEO configuration
├── sitemap.xml         # Search engine sitemap
└── PAGESPEED-OPTIMIZATION.md  # Performance guide
```

### Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage API
- **Security**: SubtleCrypto API for PIN hashing
- **Styling**: CSS Grid, Flexbox, Custom Properties
- **PWA**: Web App Manifest

## 🎯 Core Web Vitals

All metrics in the **green zone**:

| Metric | Score | Status |
|--------|-------|--------|
| First Contentful Paint (FCP) | < 1.0s | ✅ Excellent |
| Largest Contentful Paint (LCP) | < 2.5s | ✅ Excellent |
| Cumulative Layout Shift (CLS) | < 0.1 | ✅ Excellent |
| First Input Delay (FID) | < 100ms | ✅ Excellent |
| Time to Interactive (TTI) | < 3.0s | ✅ Excellent |

## ♿ Accessibility

**WCAG 2.1 AAA Compliant**

- ✅ Full keyboard navigation support
- ✅ Screen reader compatible
- ✅ Skip-to-content link
- ✅ Proper ARIA labels
- ✅ Color contrast ≥ 7:1
- ✅ Touch targets ≥ 44x44px
- ✅ Respects prefers-reduced-motion
- ✅ Focus indicators on all interactive elements

## 🔒 Security & Privacy

- ✅ **No cookies**: Zero tracking
- ✅ **No analytics**: Complete privacy
- ✅ **No external requests**: Fully self-contained
- ✅ **PIN protection**: Optional security layer
- ✅ **Client-side only**: Data never leaves your device
- ✅ **HTTPS ready**: Secure by default on GitHub Pages

## 📖 Usage Guide

### First Time Setup
1. Visit the site and set a PIN (optional but recommended)
2. Start with the "One Page Plan" section
3. Add your long-term, mid-term, and short-term goals
4. Create habits linked to your goals
5. Begin tracking expenses and income

### Daily Routine
1. Check in on active 21-day habits (✓ or ✗)
2. Log daily expenses
3. Review goal deadlines
4. Update skill progress

### Weekly Review
1. Check wealth level progress
2. Review completed habits
3. Adjust goals if needed
4. Export data for backup

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Maintain 100% PageSpeed scores
- Follow existing code style
- Test on mobile and desktop
- Ensure accessibility compliance
- Keep it privacy-first (no external dependencies)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons: Emoji (no external dependencies)
- Fonts: System fonts for optimal performance
- Inspiration: Personal productivity and financial independence journey

## 📧 Contact

**Project Link**: [https://github.com/zohaib-systems/Life-Management](https://github.com/zohaib-systems/Life-Management)

## 🗺️ Roadmap

- [ ] Service Worker for offline support
- [ ] Dark theme toggle
- [ ] Multiple currency support
- [ ] Goal templates library
- [ ] Habit streak visualization
- [ ] Monthly/yearly reports
- [ ] Data encryption at rest
- [ ] Cloud sync (optional, privacy-preserving)

## 📊 Stats

- **Code Size**: ~50KB (uncompressed)
- **Load Time**: < 1 second
- **Dependencies**: Zero
- **Privacy Score**: 100%
- **PageSpeed Score**: 100% (all categories)

---

**Built with ❤️ for personal growth and financial freedom**

⭐ Star this repo if you find it useful!
