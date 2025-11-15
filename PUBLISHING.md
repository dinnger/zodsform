# Guía de Publicación - ZodsForm

Esta guía explica cómo publicar correctamente el paquete `zodsform` en npm, asegurando que el CSS de Tailwind esté completamente compilado.

## ⚠️ Problema Común

El problema más frecuente al publicar es que el archivo `dist/styles.css` contenga las directivas de Tailwind sin procesar (`@tailwind base`, etc.) en lugar del CSS compilado. Esto hace que los usuarios vean formularios sin estilos.

## ✅ Proceso de Publicación Correcto

### 1. Asegúrate de tener todo actualizado

```bash
git pull origin main
npm install
```

### 2. Incrementa la versión

```bash
# Para parches (0.1.8 -> 0.1.9)
npm version patch

# Para cambios menores (0.1.9 -> 0.2.0)
npm version minor

# Para cambios mayores (0.2.0 -> 1.0.0)
npm version major
```

Esto actualizará automáticamente el `package.json` y creará un commit con tag.

### 3. Compila el proyecto

```bash
npm run build
```

Este comando hace dos cosas:
1. **`build:css`**: Compila Tailwind CSS (`src/styles.css` → `dist/styles.css`)
2. **`build:ts`**: Compila TypeScript (`src/**/*.ts` → `dist/**/*.js`)

### 4. Verifica que el CSS esté compilado

```bash
npm run verify:build
```

Este script verifica que:
- El archivo `dist/styles.css` existe
- NO contiene directivas `@tailwind` sin procesar
- Contiene el comentario de Tailwind compilado (`tailwindcss v4.x.x`)

Si este comando falla, **NO PUBLIQUES**. Revisa los errores y vuelve a compilar.

### 5. Prueba localmente (Opcional pero recomendado)

```bash
# Crea un paquete local
npm pack

# En otro directorio de prueba
mkdir /tmp/test-zodsform
cd /tmp/test-zodsform
npm init -y
npm install /ruta/al/proyecto/zodsform-0.1.9.tgz zod

# Crea un archivo de prueba
cat > test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/zodsform/dist/styles.css">
  <script type="module">
    import { z } from 'zod';
    import { ZodsForm } from 'zodsform';
    
    const schema = z.object({
      name: z.string().label("Nombre"),
      email: z.string().email().label("Email")
    });
    
    const form = ZodsForm.fromSchema(schema);
    document.body.appendChild(form.render());
  </script>
</head>
<body></body>
</html>
EOF

# Abre con un servidor local
npx vite
```

Verifica que los estilos se vean correctamente.

### 6. Publica a npm

```bash
# Asegúrate de estar logueado
npm whoami

# Si no estás logueado
npm login

# Publica
npm publish
```

El hook `prepublishOnly` ejecutará automáticamente:
1. `npm run build` (compila CSS y TypeScript)
2. `npm run verify:build` (verifica que el CSS esté compilado)

Si todo está correcto, se publicará. Si hay un error, se detendrá.

### 7. Sube los cambios a GitHub

```bash
git push origin main --tags
```

### 8. Crea un Release en GitHub (Opcional)

1. Ve a https://github.com/dinnger/zodsform/releases
2. Click en "Draft a new release"
3. Selecciona el tag que creaste (ej: `v0.1.9`)
4. Copia los cambios del `CHANGELOG.md`
5. Publica el release

## 🔍 Verificación Post-Publicación

Después de publicar, verifica que todo esté bien:

```bash
# En un nuevo directorio
mkdir /tmp/verify-npm
cd /tmp/verify-npm
npm install zodsform

# Verifica que el CSS esté compilado
head -n 5 node_modules/zodsform/dist/styles.css
```

Deberías ver algo como:
```css
/*! tailwindcss v4.1.17 | MIT License | https://tailwindcss.com */
@layer properties{...
```

**NO** deberías ver:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🚨 Si algo sale mal

### El CSS no está compilado después de publicar

1. Elimina el paquete de npm (dentro de 24 horas):
   ```bash
   npm unpublish zodsform@0.1.9
   ```

2. Vuelve a compilar localmente:
   ```bash
   rm -rf dist
   npm run build
   npm run verify:build
   ```

3. Verifica manualmente el archivo:
   ```bash
   head -n 10 dist/styles.css
   ```

4. Si está correcto, vuelve a publicar:
   ```bash
   npm publish
   ```

### Los usuarios reportan estilos faltantes

Si ya pasaron 24 horas y no puedes hacer unpublish:

1. Incrementa la versión:
   ```bash
   npm version patch
   ```

2. Sigue el proceso completo de publicación nuevamente

3. Informa a los usuarios que actualicen a la nueva versión:
   ```bash
   npm update zodsform
   ```

## 📝 Checklist de Publicación

Antes de publicar, verifica:

- [ ] Todos los tests pasan (`npm test`)
- [ ] El código compila sin errores (`npm run build`)
- [ ] El CSS está compilado (`npm run verify:build`)
- [ ] La versión se incrementó correctamente
- [ ] El `CHANGELOG.md` está actualizado
- [ ] Los ejemplos en `src/` funcionan correctamente
- [ ] El `README.md` está actualizado con nuevas features
- [ ] Has probado localmente con `npm pack`

## 🛠️ Scripts Disponibles

```bash
npm run build          # Compila CSS + TypeScript
npm run build:css      # Solo compila Tailwind CSS
npm run build:ts       # Solo compila TypeScript
npm run verify:build   # Verifica que el CSS esté compilado
npm run dev            # Modo desarrollo (CSS + TS watch)
npm test               # Ejecuta tests con Vitest
```

## 📚 Referencias

- [npm publish docs](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [npm version docs](https://docs.npmjs.com/cli/v9/commands/npm-version)
- [Semantic Versioning](https://semver.org/)
- [Tailwind CSS CLI](https://tailwindcss.com/docs/installation)

---

**Recuerda**: Siempre ejecuta `npm run verify:build` antes de publicar manualmente, aunque `prepublishOnly` lo hace automáticamente.
