# 🚀 Inicio Rápido - ZodsForm

## 📦 Instalación (1 minuto)

```bash
# Si aún no lo hiciste
npm install
```

## 🔨 Compilar (10 segundos)

```bash
npm run build
```

## 🌐 Ver Demos (30 segundos)

### Opción A: Vite (La más fácil)
```bash
npx vite src
```
Luego abre: http://localhost:5173

### Opción B: Python
```bash
cd src
python3 -m http.server 8000
```
Luego abre: http://localhost:8000/index.html

### Opción C: VS Code
1. Instala extensión "Live Server"
2. Click derecho en `src/index.html`
3. "Open with Live Server"

## 📄 Qué Ver

1. **`index.html`** - Demo básico con formulario de usuario
2. **`demos.html`** - 7 demos interactivas diferentes
3. **`integration-example.html`** - Ejemplo completo con API simulada

## 💡 Primer Ejemplo

Crea un archivo `test.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <link rel="stylesheet" href="src/styles.css">
  <script type="module">
    import { z } from "zod";
    import { ZodsForm } from "./src/index.ts";

    const schema = z.object({
      name: z.string().min(2, "Muy corto"),
      email: z.string().email("Email inválido"),
      age: z.number().min(18, "Debes ser mayor de edad"),
    });

    const form = ZodsForm.fromSchema(schema, {
      onSubmit: (data) => alert(JSON.stringify(data, null, 2))
    });

    document.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(form.render());
    });
  </script>
</head>
<body></body>
</html>
```

Abre con un servidor local y ¡listo!

## 📚 Siguientes Pasos

1. Lee `README.md` para la API completa
2. Revisa `examples.ts` para más casos de uso
3. Lee `DEVELOPMENT.md` para personalizaciones

## 🆘 Ayuda

- **Error de módulos**: Asegúrate de usar un servidor local (no abrir archivo directamente)
- **Zod no encontrado**: Ejecuta `npm install`
- **No compila**: Verifica TypeScript con `npm run build`

---

**¿Listo? ¡Ejecuta `npm run build && npx vite src` y empieza!**
