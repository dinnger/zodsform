# ClarifyJS AI Coding Agent Instructions

## Project Overview
ClarifyJS is a TypeScript library that generates dynamic HTML forms with automatic validation from Zod schemas. It provides real-time validation, Tailwind CSS styling, and a component-based architecture for customization.

## Core Architecture

### The Three-Layer System
1. **Zod Schema** → Defines validation rules and field types
2. **Structure** → Internal representation of form fields (auto-generated from Zod or manually defined)
3. **Components** → Rendering system for input elements (default or custom)

**Key Class: `ZodExtractor`**
- `extractValidationInfo()`: Extracts validation metadata from Zod schemas (min, max, email, etc.)
- `schemaToStructure()`: Converts Zod schemas to internal `Structure` format
- Handles nested objects (`z.object()`), enums (`z.enum()`), optional fields (`z.optional()`)

**Key Class: `ClarifyJS`**
- Main form engine that renders, validates, and manages form state
- Uses a nested path system (`"user.address.street"`) for field tracking
- Maintains `formData` and `errors` state internally

### Component Priority System (Most to Least Specific)
1. **Zod-level**: `.component(CustomComponent)` on individual schema fields
2. **Instance by name**: `components: { fieldName: Component }` in form config
3. **Global by name**: `ClarifyJS.registerComponent('fieldName', Component)`
4. **Instance by type**: `components: { boolean: Component }` in form config
5. **Global by type**: `ClarifyJS.registerComponent('boolean', Component)`
6. **Default components**: Built-in `TextInput`, `PasswordInput`, `CheckboxInput`, etc.

## Critical Patterns

### Zod Extensions (Chaining Methods)
ClarifyJS extends Zod's `ZodType.prototype` with custom methods:
```typescript
z.string().label("Custom Label")           // Sets display label
z.string().properties({ size: 6 })        // Grid size (1-12 columns)
z.string().password(true)                 // Renders as password with toggle
z.boolean().component(ToggleSwitch)       // Custom component for this field
```
These are stored in `_def` object and extracted by `ZodExtractor`.

### Field Path System
All fields use dot-notation paths: `"user.email"`, `"address.street"`. Methods like `getNestedValue()` and `setNestedValue()` handle deeply nested objects. **Never use bracket notation or array indices** for field paths.

### Validation Timing
- **onChange**: Updates `formData`, calls `onChange` callback
- **onBlur**: Triggers `validateField()` for single field
- **onSubmit**: Validates all fields with `validateAllFields()`, then full schema validation

### Mask System
Masks are applied via `properties.mask`:
- **String format**: `"###-####"` (auto-formats input, stores raw value in `data-raw-value`)
- **Regex**: `/^[1-6]\d{0,5}$/` (validates each character on input)
- **Critical**: Always read `data-raw-value` attribute for formatted fields, not `input.value`

### Custom Component Interface
```typescript
interface ComponentConfig {
  render: (config: RenderConfig) => HTMLElement;  // Required
  getValue?: (element: HTMLElement) => any;       // Optional
  setValue?: (element: HTMLElement, value: any) => void;  // Optional
}
```
Components must return a wrapper element containing the actual input. See `src/components/CheckboxInput.ts` and `src/custom-components.ts` for examples.

## Development Workflow

### Build & Dev Commands
```bash
npm run build        # Compile TS + build Tailwind CSS (production)
npm run dev          # Watch mode for TypeScript only
npm run dev:css      # Watch mode for Tailwind CSS only
npm run build:css    # Build Tailwind CSS only
npm run build:ts     # Build TypeScript only
```

### Running Demos
**Recommended**: `npx vite src` then open http://localhost:5173
- `index.html`: Basic user registration demo
- `demos.html`: 7 interactive examples (registration, address, product, etc.)
- `integration-example.html`: Full API integration example
- `element-selector-demo.html`: Auto-mounting with `el` selector

### TypeScript Configuration
Uses **strict mode** with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Module resolution is `bundler` (ESNext). All source in `src/`, output in `dist/`.

## Common Gotchas

1. **Empty string vs undefined**: Optional fields should use `undefined`, not `""`. Check with `|| undefined` when extracting values.

2. **Enum with labels**: ClarifyJS extends `z.enum()` to accept objects:
   ```typescript
   z.enum({ mx: "México", us: "USA" })  // Keys for validation, values for display
   ```
   The extractor stores this in `_def.valuesMap`.

3. **Password fields**: Automatically detected if `.password()` is called OR if `isPassword: true` in `_def`.

4. **Grid sizing**: Default is 3 columns for inputs, 12 for `box` containers. Override with `.properties({ size: 6 })`.

5. **Error state tracking**: `previousErrorFields` Set tracks fields that have shown errors. Used for `refine()` cross-field validation display.

6. **Auto-mounting**: If `el` (string selector or HTMLElement) is provided to constructor or `fromSchema()`, form auto-mounts on `render()`.

## File Organization

- **`src/index.ts`**: Main library - Zod extensions, ClarifyJS class, ZodExtractor
- **`src/components/`**: Component system - types, default implementations
- **`src/examples.ts`**: 7 example forms demonstrating features
- **`src/custom-components.ts`**: Example custom components (ToggleSwitch, StyledCheckbox)
- **`src/styles.css`**: Tailwind base + custom utilities
- **`COMPONENTS_GUIDE.md`**: Complete component customization documentation
- **`QUICKSTART.md`**: 5-minute setup guide

## Integration Notes

- **Spanish-first**: All labels, errors, and docs are in Spanish by default
- **Tailwind v4**: Uses `@tailwindcss/cli` v4.1.17 with PostCSS
- **Zod peer dependency**: Compatible with Zod 3.x or 4.x
- **No build step for users**: Distributes compiled JS + CSS in `dist/`
- **Browser target**: ESNext, DOM APIs only (no Node.js dependencies)

## When Making Changes

1. **Adding field types**: Update `StructureItem.type`, create component in `src/components/`, add to `DefaultComponents`
2. **Zod features**: Add extraction logic in `ZodExtractor.extractValidationInfo()` switch cases
3. **Validation logic**: Modify `validateField()` for individual, `validateAllFields()` for full form
4. **Styling**: Edit `src/styles.css` and run `npm run build:css` to regenerate
5. **Components**: Follow existing patterns in `src/components/` - always return wrapper with actual input inside

## Testing Strategy
No automated tests yet. Manual testing via demos:
1. Run `npx vite src`
2. Test in `demos.html` - covers all major features
3. Check console for validation logs and errors
4. Verify responsive behavior (grid resizing)

---

*This project prioritizes developer experience: simple API, zero config, works immediately after `npm install`. When adding features, maintain this philosophy.*
