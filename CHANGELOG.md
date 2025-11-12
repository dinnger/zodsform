# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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

[0.1.0]: https://github.com/dinnger/ClarifyJS/releases/tag/v0.1.0
