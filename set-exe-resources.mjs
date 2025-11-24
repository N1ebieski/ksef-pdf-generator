import { rcedit } from 'rcedit';
import { readFileSync } from 'fs';
import path from 'path';

// Konfiguracja
const COMPANY_NAME = 'SoftVig'; // Dostosuj do swoich potrzeb
const PRODUCT_NAME = 'KSeF PDF Generator';
const COPYRIGHT = `Copyright (C) ${new Date().getFullYear()} ${COMPANY_NAME}`;

// Pobierz wersję z package.json
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const version = pkg.version;

const exePath = process.argv[2];

if (!exePath) {
  console.error('❌ Błąd: Nie podano ścieżki do pliku .exe');
  console.error('Użycie: node scripts/set-exe-resources.mjs <path-to-exe>');
  process.exit(1);
}

console.log(`📝 Aktualizacja metadanych pliku: ${exePath}`);
console.log(`   - Wersja: ${version}`);
console.log(`   - Firma: ${COMPANY_NAME}`);
console.log(`   - Copyright: ${COPYRIGHT}`);

try {
  await rcedit(exePath, {
    'version-string': {
      'CompanyName': COMPANY_NAME,
      'LegalCopyright': COPYRIGHT,
      'FileDescription': PRODUCT_NAME,
      'ProductName': PRODUCT_NAME,
      'OriginalFilename': path.basename(exePath),
      'InternalName': path.basename(exePath, path.extname(exePath))
    },
    'file-version': version,
    'product-version': version,
    // 'icon': 'assets/icon.ico' // Odkomentuj jeśli masz ikonę
  });
  console.log('✅ Metadane zostały zaktualizowane pomyślnie.');
} catch (error) {
  console.error('❌ Błąd podczas aktualizacji metadanych:', error);
  process.exit(1);
}
