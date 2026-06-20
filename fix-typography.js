const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) walk(dirPath, callback);
        else callback(path.join(dir, f));
    });
}

function processFile(filepath) {
    if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts')) return;

    let content = fs.readFileSync(filepath, 'utf8');
    let origContent = content;

    // Use a regex that replaces tokens globally but strictly matching the tokens
    // We can just globally replace the exact strings because they shouldn't appear
    // in code except in classNames.
    const tokens = [
        'font-mono ', ' font-mono',
        'font-serif ', ' font-serif',
        'uppercase ', ' uppercase',
        'tracking-widest ', ' tracking-widest',
        'tracking-wider ', ' tracking-wider',
        'tracking-tight ', ' tracking-tight',
        'tracking-tighter ', ' tracking-tighter',
        'text-black ', ' text-black',
    ];

    // For tracking-[0.6em] type classes, we can use a safe global regex
    content = content.replace(/\btracking-\[[^\]]+\]\s?/g, '');

    for (const t of tokens) {
        // safe replace with word boundaries if needed, but simple split/join works too for exact substrings.
        // Actually regex is safer
    }

    // Safer regex global replace
    const regexes = [
        /\bfont-mono\b\s*/g,
        /\bfont-serif\b\s*/g,
        /\buppercase\b\s*/g,
        /\btracking-widest\b\s*/g,
        /\btracking-wider\b\s*/g,
        /\btracking-tight\b\s*/g,
        /\btracking-tighter\b\s*/g,
    ];

    for (const r of regexes) {
        content = content.replace(r, '');
    }

    // specific headings
    content = content.replace(/\btext-5xl md:text-6xl text-black\b/g, 'text-display-lg text-foreground');
    content = content.replace(/\btext-5xl md:text-6xl\b/g, 'text-display-lg');
    content = content.replace(/\btext-3xl text-black\b/g, 'text-display-sm text-foreground');
    content = content.replace(/\btext-3xl\b/g, 'text-display-sm');

    // Fix trailing spaces in className strings caused by removal
    content = content.replace(/className="([^"]+)"/g, (match, p1) => {
        return 'className="' + p1.replace(/\s+/g, ' ').trim() + '"';
    });

    if (content !== origContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('Updated', filepath);
    }
}

walk('./src/components', processFile);
walk('./src/app', processFile);
