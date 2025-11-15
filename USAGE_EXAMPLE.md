# Ejemplo de Uso - ZodsForm

Este es un ejemplo mínimo de cómo usar ZodsForm en tu proyecto.

## Instalación

```bash
npm install zodsform zod
```

## Uso Básico

### 1. Proyecto TypeScript con Vite/Webpack

**src/main.ts**
```typescript
import { z } from 'zod';
import { ZodsForm } from 'zodsform';
// ⚠️ IMPORTANTE: Importar los estilos
import 'zodsform/dist/styles.css';

const userSchema = z.object({
  firstName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .label("Nombre")
    .properties({ size: 6 }),
  
  lastName: z.string()
    .min(2, "Mínimo 2 caracteres")
    .label("Apellido")
    .properties({ size: 6 }),
  
  email: z.string()
    .email("Email inválido")
    .label("Correo Electrónico"),
  
  age: z.number()
    .min(18, "Debes ser mayor de edad")
    .label("Edad")
    .properties({ size: 4 }),
});

const form = ZodsForm.fromSchema(userSchema, {
  el: '#app', // Montaje automático en este elemento
  onSubmit: (data) => {
    console.log('Datos validados:', data);
    // Enviar a tu API
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  onChange: (data, errors) => {
    console.log('Datos actuales:', data);
    console.log('Errores:', errors);
  }
});

form.render();
```

**index.html**
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Formulario</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 2. Proyecto HTML Vanilla (CDN)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario con ZodsForm</title>
  <!-- ⚠️ IMPORTANTE: Incluir los estilos -->
  <link rel="stylesheet" href="node_modules/zodsform/dist/styles.css">
</head>
<body>
  <div id="root"></div>
  
  <script type="module">
    import { z } from './node_modules/zod/lib/index.mjs';
    import { ZodsForm } from './node_modules/zodsform/dist/index.js';
    
    const schema = z.object({
      name: z.string().min(2).label("Nombre"),
      email: z.string().email().label("Email")
    });
    
    const form = ZodsForm.fromSchema(schema, {
      el: '#root',
      onSubmit: (data) => alert(JSON.stringify(data, null, 2))
    });
    
    form.render();
  </script>
</body>
</html>
```

### 3. Proyecto React/Vue/Angular

**React Example (App.tsx)**
```typescript
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { ZodsForm } from 'zodsform';
// ⚠️ IMPORTANTE: Importar los estilos
import 'zodsform/dist/styles.css';

const userSchema = z.object({
  name: z.string().min(2).label("Nombre"),
  email: z.string().email().label("Email"),
  age: z.number().min(18).label("Edad")
});

function MyForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const form = ZodsForm.fromSchema(userSchema, {
      onSubmit: (data) => {
        console.log('Datos:', data);
        // Llamar a tu API
      }
    });
    
    containerRef.current.appendChild(form.render());
  }, []);
  
  return <div ref={containerRef} />;
}

export default MyForm;
```

## Troubleshooting

### ❌ Los estilos no se aplican

**Problema**: Los formularios se ven sin estilos o muy básicos.

**Solución**: Asegúrate de importar el CSS:

```typescript
import 'zodsform/dist/styles.css';
```

O en HTML:

```html
<link rel="stylesheet" href="node_modules/zodsform/dist/styles.css">
```

### ❌ Error: Cannot find module 'zodsform'

**Problema**: El módulo no se encuentra.

**Solución**: Asegúrate de haber instalado el paquete:

```bash
npm install zodsform zod
```

### ❌ Los formularios no se muestran

**Problema**: El contenedor existe pero el formulario no se renderiza.

**Solución**: Verifica que:

1. El elemento existe en el DOM antes de llamar a `render()`:
   ```typescript
   // ✅ Correcto
   document.addEventListener('DOMContentLoaded', () => {
     const form = ZodsForm.fromSchema(schema, { el: '#app' });
     form.render();
   });
   
   // ❌ Incorrecto (el DOM no está listo)
   const form = ZodsForm.fromSchema(schema, { el: '#app' });
   form.render();
   ```

2. O renderiza manualmente:
   ```typescript
   const form = ZodsForm.fromSchema(schema);
   document.getElementById('app')?.appendChild(form.render());
   ```

### ❌ Error: "Cannot read property 'appendChild' of null"

**Problema**: El selector CSS no encuentra el elemento.

**Solución**: 

1. Verifica que el ID/clase exista en tu HTML
2. Asegúrate de que el script se ejecute después de que el DOM esté listo
3. Usa un selector válido: `#app`, `.container`, etc.

## Ejemplos Completos

Para más ejemplos, consulta:

- [README.md](./README.md) - Documentación completa con todos los features
- [src/demos.html](./src/demos.html) - 7 demos interactivas
- [src/examples.ts](./src/examples.ts) - Código de los ejemplos

## Soporte

- **Issues**: https://github.com/dinnger/zodsform/issues
- **NPM**: https://www.npmjs.com/package/zodsform
- **Documentación**: https://github.com/dinnger/zodsform#readme
