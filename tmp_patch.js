const fs = require('fs');

let code = fs.readFileSync('app/admin/page.js', 'utf8');

// Update dropdownClasses definition
code = code.replace(
    'const dropdownClasses = "w-full bg-gray-900 text-white border border-gray-700 p-3 rounded-xl hover:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none cursor-pointer";',
    'const dropdownClasses = "w-full bg-white text-black border border-gray-300 p-3 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-colors outline-none cursor-pointer";'
);

// Update ALL raw inputs to have text-black explicitly if they don't already
code = code.replace(/<input([^>]+)className="([^"]+)"/g, (match, prefix, classNames) => {
    let classes = classNames.split(' ');
    if (!classes.includes('text-black')) {
        classes.push('text-black');
    }
    // Remove text-gray-* or text-white if present to avoid conflicts
    classes = classes.filter(c => !c.startsWith('text-gray-') && c !== 'text-white');
    return `<input${prefix}className="${classes.join(' ')}"`;
});

// There is also one <select in "Documents Filters" and one in "Managed Subjects" with dark theme inline
code = code.replace(
    'className="bg-gray-900 text-white border border-gray-700 p-2 rounded-lg text-sm outline-none"',
    'className="bg-white text-black border border-gray-300 p-2 rounded-lg text-sm outline-none"'
);
code = code.replace(
    'className="bg-gray-900 text-white border border-gray-700 p-2 rounded-lg text-sm flex-1 sm:w-48 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"',
    'className="bg-white text-black border border-gray-300 p-2 rounded-lg text-sm flex-1 sm:w-48 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"'
);

fs.writeFileSync('app/admin/page.js', code);
console.log('Styles updated');
