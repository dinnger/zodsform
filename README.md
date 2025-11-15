# ZodsForm 🚀

**TypeScript library to create dynamic forms with automatic validation using Zod and Tailwind CSS**

ZodsForm allows you to create complete HTML forms from Zod schemas or JSON structures, with real-time validation, Tailwind CSS styling, and a simple, intuitive API.

![Form Preview](src/assets/img/form.png)
## ✨ Features

* 🎯 **Automatic Generation from Zod**: Convert Zod schemas into fully functional forms
* ✅ **Real-time Validation**: Validate as the user types or on blur
* 🎨 **Tailwind CSS Integration**: Modern and responsive styles with Tailwind CSS
* 🔄 **Nested Fields Support**: Objects and complex structures
* 📦 **Native TypeScript**: Full typings and autocompletion
* 🎛️ **Highly Configurable**: Customize labels, placeholders, and descriptions
* 🌐 **Multiple Input Types**: text, number, email, password, textarea, select, checkbox
* 🎯 **Automatic Mounting**: Specify where the form should be rendered

## 📦 Installation

```bash
npm install zodsForm zod
# Tailwind CSS is included in the package
```

## 🚀 Quick Usage

### 1. From a Zod Schema with Element Selector (Recommended)

```typescript
import { ZodsForm, z } from "zodsForm";

// Define your Zod schema
const userSchema = z.object({
  firstName: z.string().min(2, "At least 2 characters"),
  lastName: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "You must be an adult"),
});

// Automatically create the form with an element selector
const form = ZodsForm.fromSchema(userSchema, {
  el: "#root", // CSS selector or DOM element
  labels: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    age: "Age",
  },
  onSubmit: (data) => {
    console.log("Validated data:", data);
    // Send to your API
  },
  onChange: (data, errors) => {
    console.log("Current data:", data);
    console.log("Errors:", errors);
  },
});

// Automatically mounts on the selected element
form.render();

// Or manually mount without specifying 'el':
// document.getElementById("root")?.appendChild(form.render());
```

### 2. With Direct DOM Element

```typescript
const targetElement = document.getElementById("form-container");

const form = ZodsForm.fromSchema(userSchema, {
  el: targetElement,
  onSubmit: (data) => console.log(data),
});

form.render();
```

### 3. From JSON Structure

```typescript
import { ZodsForm, Structure } from "zodsForm";

const structure: Structure = {
  email: {
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    required: true,
    description: "Enter your email address",
  },
  password: {
    type: "password",
    label: "Password",
    required: true,
    properties: {
      min: 8,
    },
  },
  bio: {
    type: "textarea",
    label: "Biography",
    placeholder: "Tell us about yourself...",
    size: 12,
  },
};

const form = new ZodsForm({
  structure,
  onSubmit: (data) => console.log(data),
});

document.getElementById("root")?.appendChild(form.render());
```

## 📚 Supported Field Types

| Type       | Description        | Zod Example          |
| ---------- | ------------------ | -------------------- |
| `text`     | Text input         | `z.string()`         |
| `number`   | Numeric input      | `z.number()`         |
| `email`    | Email input        | `z.string().email()` |
| `password` | Password input     | `z.string()`         |
| `textarea` | Text area          | `z.string()`         |
| `select`   | Dropdown select    | `z.enum()`           |
| `checkbox` | Checkbox           | `z.boolean()`        |
| `section`  | Visual container   | -                    |
| `box`      | Bordered container | Nested objects       |

## 🎨 Field Structure

```typescript
interface StructureItem {
  type: "text" | "number" | "email" | "password" | "textarea" | "select" | "checkbox" | "section" | "box";
  label?: string;
  size?: number;
  placeholder?: string;
  description?: string;
  required?: boolean;
  properties?: {
    disabled?: boolean;
    min?: number;
    max?: number;
    options?: Array<{ value: string | number; label: string }>;
  };
  children?: Structure;
  validation?: z.ZodTypeAny;
}
```

## 🔥 Advanced Examples

### Nested Objects Form

```typescript
const addressSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.number().int(),
  }),
});

const form = ZodsForm.fromSchema(addressSchema, {
  onSubmit: (data) => console.log(data),
});
```

### Select (Enum)

```typescript
const formSchema = z.object({
  country: z.enum(["USA", "Mexico", "Spain", "Argentina"]),
  role: z.enum(["admin", "user", "guest"]),
});

const form = ZodsForm.fromSchema(formSchema);
```

### Custom Validations

```typescript
const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  age: z.number().min(18).max(100),
  website: z.string().url().optional(),
});
```

### Sections Structure

```typescript
const structure: Structure = {
  personalInfo: {
    type: "section",
    label: "Personal Information",
    children: {
      firstName: { type: "text", label: "First Name", size: 6 },
      lastName: { type: "text", label: "Last Name", size: 6 },
    },
  },
  contactInfo: {
    type: "box",
    label: "Contact Information",
    children: {
      email: { type: "email", label: "Email", size: 12 },
      phone: { type: "text", label: "Phone", size: 12 },
    },
  },
};
```

## 🎛️ API

### `ZodsForm.fromSchema(schema, config)`

Create a form from a Zod schema.

**Parameters:**

* `schema`: ZodObject
* `config`:

  * `el?`: CSS selector or DOM element
  * `labels?`: Custom labels per field
  * `onSubmit?`: Callback when form is valid
  * `onChange?`: Callback for each field change

**Returns:** ZodsForm instance

### `new ZodsForm(config, el?)`

Create a form from JSON structure.

**Parameters:**

* `config.structure`: Form structure
* `config.schema?`: Optional Zod schema
* `config.onSubmit?`
* `config.onChange?`
* `el?`: Selector or DOM element

## Instance Methods

* `form.render(): HTMLElement`
* `form.getData(): any`
* `form.getErrors(): any`
* `form.setData(data)`
* `form.setFieldProperty(fieldPath, property, value)`

## 🎨 Style Customization

ZodsForm uses Tailwind CSS.

### Via `tailwind.config.js`

```javascript
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}", "./dist/**/*.js"],
  theme: {
    extend: { colors: { primary: '#your-color' } },
  },
  plugins: [],
}
```

### Overriding CSS Classes

```css
.zodsForm-form { @apply bg-gray-50 p-6 rounded-xl shadow-2xl; }
.zodsForm-field input { @apply border-purple-300 focus:border-purple-500; }
.zodsForm-error { @apply text-red-600 font-medium; }
.zodsForm-submit { @apply bg-gradient-to-r from-purple-500 to-blue-500; }
```

### Default Tailwind Classes

* Form: `bg-white p-8 rounded-lg shadow-lg`
* Inputs: `w-full px-3 py-2 border-2 border-gray-300 rounded-md`
* Submit Button: `w-full bg-blue-500 text-white`
* Errors: `text-xs text-red-500`

## 🔧 Grid System

Uses 12-column grid via `size`.

```typescript
{
  firstName: { type: "text", size: 6 },
  lastName: { type: "text", size: 6 },
  bio: { type: "textarea", size: 12 },
}
```

## 🔍 Validation Extractor

```typescript
import { ZodExtractor } from "zodsForm";

const schema = z.string().email().min(5).max(50);
const info = ZodExtractor.extractValidationInfo(schema);
```

## 🌟 Full Example

```typescript
import { z } from "zod";
import { ZodsForm } from "zodsForm";

const registrationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  age: z.number().min(18),
  country: z.enum(["USA", "Mexico", "Spain", "Argentina"]),
  bio: z.string().max(500).optional(),
  newsletter: z.boolean().optional(),

```
