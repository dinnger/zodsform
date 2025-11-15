#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const distCssPath = join(process.cwd(), 'dist', 'styles.css');

// Verificar que el archivo CSS exista
if (!existsSync(distCssPath)) {
  console.error('❌ ERROR: dist/styles.css no existe. Ejecuta "npm run build:css" primero.');
  process.exit(1);
}

// Leer el contenido del CSS
const cssContent = readFileSync(distCssPath, 'utf-8');

// Verificar que NO contenga las directivas de Tailwind sin procesar
if (cssContent.includes('@tailwind base') || 
    cssContent.includes('@tailwind components') || 
    cssContent.includes('@tailwind utilities')) {
  console.error('❌ ERROR: dist/styles.css contiene directivas @tailwind sin procesar.');
  console.error('   El CSS no ha sido compilado correctamente.');
  console.error('   Ejecuta "npm run build:css" para compilar Tailwind CSS.');
  process.exit(1);
}

// Verificar que contenga el comentario de Tailwind compilado
if (!cssContent.includes('tailwindcss v')) {
  console.error('⚠️  ADVERTENCIA: dist/styles.css no parece estar compilado por Tailwind.');
  console.error('   Asegúrate de ejecutar "npm run build:css" antes de publicar.');
  process.exit(1);
}

console.log('✅ Verificación exitosa: CSS compilado correctamente');
process.exit(0);
