const fs = require('fs');
const path = require('path');

const serverPath = path.join(process.cwd(), 'server.js');
let s = fs.readFileSync(serverPath, 'utf8');

if (s.includes('serviceRoutes')) {
  console.log('ℹ️  service route already exists');
} else {
  s = s.replace(
    "app.use('/api/upload'",
    "app.use('/api/services', require('./routes/serviceRoutes'));\napp.use('/api/upload'"
  );
  fs.writeFileSync(serverPath, s);
  console.log('✅ service route added to server.js');
}
