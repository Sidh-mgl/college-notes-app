const fs = require('fs');
const babylon = require('@babel/parser');

try {
  const code = fs.readFileSync('app/admin/page.js', 'utf8');
  babylon.parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });
  console.log("No syntax errors!");
} catch (e) {
  console.error("Syntax Error at line " + e.loc.line + ", column " + e.loc.column);
  console.error(e.message);
}
