import sharp from 'sharp'
import { writeFileSync } from 'fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="15" y="4" width="2" height="8" fill="#16a34a"/>
  <rect x="15" y="20" width="2" height="8" fill="#16a34a"/>
  <rect x="4" y="15" width="8" height="2" fill="#16a34a"/>
  <rect x="20" y="15" width="8" height="2" fill="#16a34a"/>
  <circle cx="16" cy="16" r="2" fill="#16a34a"/>
</svg>`

const buf = Buffer.from(svg)
await sharp(buf).resize(256, 256).png().toFile('public/crosshair.png')
console.log('아이콘 생성 완료')