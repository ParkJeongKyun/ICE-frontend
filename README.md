# ICE - Forensic Web Application Repository

A web application for forensic analysis, including hex viewers and image EXIF metadata analysis.

## Official Website

Visit the official website for more details:  
[www.ice-forensic.com](https://www.ice-forensic.com)

© 2022 Park Jeong-Kyun (dbzoseh84@gmail.com). All rights reserved.

---

## How to Run

```bash
npm install
npm run dev
```

## How to Build

Follow these steps to build and deploy the project:

1. Switch to the `master` branch & merge & push:

   ```bash
   git checkout master
   git merge origin devel
   git push origin master

   git tag v2026.04.03
   # git tag -f v2026.04.03
   git push origin v2026.04.03
   # git push origin v2026.04.03 --force
   ```
