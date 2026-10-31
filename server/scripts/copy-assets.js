import fs from 'fs';
import path from 'path';

fs.mkdirSync('dist/database', { recursive: true });
if (fs.existsSync('src/database/seed.json')) {
  fs.copyFileSync('src/database/seed.json', 'dist/database/seed.json');
}
if (fs.existsSync('src/database/schema.sql')) {
  fs.copyFileSync('src/database/schema.sql', 'dist/database/schema.sql');
}
console.log('Database assets copied to dist/database');
