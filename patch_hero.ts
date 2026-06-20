import fs from 'fs';
let content = fs.readFileSync('src/components/marketing/HeroSection.tsx', 'utf8');

content = content.replace(
    'className={`relative mx-auto max-w-7xl px-6 lg:px-8 ${hasImage ? "pt-40 pb-24 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40" : "py-24 md:py-32 lg:py-40"}`}',
    'className={`relative mx-auto max-w-7xl px-6 lg:px-8 ${hasImage ? "pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32" : "py-24 md:py-32 lg:py-40"}`}'
);

fs.writeFileSync('src/components/marketing/HeroSection.tsx', content);
console.log('Fixed hero padding');
