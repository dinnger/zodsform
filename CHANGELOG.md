# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.2.0] - 2025-11-14

### 🎉 CAMBIO IMPORTANTE: Migración a CSS Puro

ZodsForm ahora usa **CSS puro** en lugar de Tailwind CSS, eliminando completamente la dependencia y cualquier problema con estilos que no se aplicaban correctamente.

### Añadido
- ✨ Todos los estilos ahora son CSS puro y vanilla - sin frameworks CSS externos
- ✅ Script de verificación automática (`verify:build`) para asegurar integridad del CSS
- 📚 Guía completa de publicación (`PUBLISHING.md`) con checklist y troubleshooting
- 🎨 Nuevas clases CSS personalizadas para todos los componentes (`zodsForm-*`)

### Cambiado
- � **BREAKING**: Removida completamente la dependencia de Tailwind CSS
- 🎨 Todos los componentes ahora usan clases CSS personalizadas en lugar de clases de Tailwind
- 📦 Build process simplificado - solo copia el archivo CSS (no requiere compilación)
- 📝 Documentación actualizada reflejando el uso de CSS puro
- 🔧 Scripts de build simplificados en `package.json`

### Arreglado
- � **Resuelto problema crítico**: Los estilos ahora funcionan correctamente al instalar el paquete desde npm
- 🐛 Eliminados todos los problemas relacionados con configuración de Tailwind
- 🐛 Ya no hay estilos faltantes o directivas `@tailwind` sin procesar

### Removido
- ❌ Removida dependencia de `@tailwindcss/cli`
- ❌ Removida dependencia de `@tailwindcss/postcss`
- ❌ Removida dependencia de `tailwindcss`
- ❌ Removida dependencia de `autoprefixer`
- ❌ Removida dependencia de `postcss`
- ❌ Removidos archivos de configuración `tailwind.config.js` y `postcss.config.js` (ya no necesarios)
- ❌ Removidas todas las clases de Tailwind del código TypeScript

### Nota de Migración

Si estabas usando ZodsForm versión 0.1.x, esta versión es **totalmente compatible** con tu código existente. Los únicos cambios son internos (CSS). Tu código de formularios funcionará exactamente igual pero con estilos más confiables.

```typescript
// Tu código sigue funcionando igual
import { z } from 'zod';
import { ZodsForm } from 'zodsform';
import 'zodsform/dist/styles.css'; // ¡Ahora con CSS puro!

const schema = z.object({
  name: z.string().label("Nombre")
});

const form = ZodsForm.fromSchema(schema);
form.render();
```

## [0.1.0] - 2025-11-12

### Añadido
- ✨ Generación automática de formularios desde esquemas Zod
- 🔍 Extractor de validaciones desde esquemas Zod
- ✅ Validación en tiempo real mientras el usuario escribe
- 🎨 Sistema de grid responsive de 12 columnas
- 📦 Soporte para campos anidados (objetos)
- 🎛️ Múltiples tipos de input: text, number, email, password, textarea, select, checkbox
- 🏗️ Contenedores especiales: section y box
- 🎯 Callbacks para onChange y onSubmit
- 💅 Estilos CSS modernos incluidos
- 📝 API para obtener y establecer datos del formulario
- 🔧 Configuración flexible de labels, placeholders y descripciones
- 🚨 Mensajes de error personalizados desde Zod
- ♿ Campos deshabilitados y de solo lectura
- 📏 Validaciones de min/max para números y strings
- 🎨 Animaciones y transiciones suaves
- 📱 Diseño completamente responsive

### Documentación
- 📚 README completo con ejemplos
- 💡 7 ejemplos de uso diferentes
- 🎯 Archivo de demos interactivas
- 📖 Documentación de API completa

### Configuración
- ⚙️ Configuración de TypeScript para navegador
- 📦 Configuración de package.json para npm
- 🔧 Archivos de desarrollo (gitignore, license)

### Tipos Soportados
- `z.string()` → text input (con soporte para email, url, regex)
- `z.number()` → number input (con min, max, int)
- `z.boolean()` → checkbox
- `z.enum()` → select dropdown
- `z.object()` → box contenedor con campos anidados
- `z.optional()` → campos opcionales
- Validaciones personalizadas con mensajes de error

[0.1.0]: https://github.com/dinnger/zodsform/releases/tag/v0.1.0
