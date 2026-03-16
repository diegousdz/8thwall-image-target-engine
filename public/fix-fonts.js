const fs = require('fs');
const files = ['offline/xrextras.js', 'offline/landing-page.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace all cdn.8thwall.com font URLs with '#' to prevent network requests and CORS errors
  // Regex to match url('...') or url(...) with the 8thwall domain
  const newContent = content.replace(/(https?:)?\/\/cdn\.8thwall\.com\/web\/fonts\/([a-zA-Z0-9_-]+)\.(woff|woff2|ttf|eot|svg)/g, '#');
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent, 'utf8');
    console.log(`Replaced 8thwall font URLs in ${f}`);
  } else {
    console.log(`No matching 8thwall font URLs found in ${f}`);
  }
});
