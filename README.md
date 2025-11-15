# ZodsForm 🚀

**TypeScript library to create dynamic forms with automatic validation using Zod and Tailwind CSS**

ZodsForm (formerly ClarifyJS) allows you to create complete HTML forms from Zod schemas or JSON structures, with real-time validation, Tailwind CSS styling, and a simple, intuitive API.

![Form Preview](src/assets/img/form.png)

## ✨ Features

- 🎯 **Auto-generation from Zod**: Convert Zod schemas into functional forms
- ✅ **Real-time validation**: Validation while user types and on blur
- 🎨 **Tailwind CSS v4 integrated**: Modern and responsive styles
- 🔄 **Nested field support**: Objects and complex structures with dot-notation
- 📦 **Native TypeScript**: Full typing and autocomplete
- 🎭 **Input masks**: Automatic formatting (phone, credit card, ZIP, etc.) with string or regex
- 🔐 **Password fields**: With automatic show/hide toggle
- 🎨 **Custom components**: 3-level system (global, instance, field)
- 🎛️ **Dynamic properties**: Change visibility, size, options in real-time
- 🌐 **Multiple input types**: text, number, email, password, textarea, select, checkbox
- 🎯 **Auto-mounting**: Specify the element where the form will be mounted
- 🔍 **Cross-field validation**: Support for Zod's `.refine()` (e.g., confirm password)

## 📦 Installation

```bash
npm install zodsform zod
```

Or with yarn:

```bash
yarn add zodsform zod
```

**Note**: CSS styles are included in the package. Just import them:

```typescript
import 'zodsform/dist/styles.css'
```

