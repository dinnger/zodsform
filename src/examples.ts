import { ClarifyJS, z } from "./index";
import type { Structure } from "./index";

// ==================== EJEMPLO 1: FORMULARIO DE REGISTRO ====================
export function registrationFormExample() {
  const registrationSchema = z.object({
    firstName: z.string().min(2, "Mínimo 2 caracteres").label("Nombre"),
    lastName: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().style,
    age: z.number().min(18, "Debes ser mayor de edad").max(120),
    country: z.enum(["México", "USA", "España", "Argentina"]),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: "Debes aceptar los términos",
    }).label("Acepto términos y condiciones"),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

  return ClarifyJS.fromSchema(registrationSchema, {
    labels: {
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      age: "Edad",
      country: "País",
      acceptTerms: "Acepto términos y condiciones",
    },
    onSubmit: (data) => {
      console.log("Registro exitoso:", data);
      alert("¡Registro exitoso! Ver consola.");
    },
  });
}

// ==================== EJEMPLO 2: FORMULARIO DE CONTACTO ====================
export function contactFormExample() {
  const structure: Structure = {
    personalInfo: {
      type: "section",
      label: "Información Personal",
      children: {
        name: {
          type: "text",
          label: "Nombre Completo",
          required: true,
          placeholder: "Juan Pérez",
          size: 6,
        },
        email: {
          type: "email",
          label: "Email",
          required: true,
          placeholder: "juan@ejemplo.com",
          size: 6,
        },
      },
    },
    message: {
      type: "section",
      label: "Mensaje",
      children: {
        subject: {
          type: "text",
          label: "Asunto",
          required: true,
          placeholder: "¿En qué podemos ayudarte?",
          size: 12,
        },
        body: {
          type: "textarea",
          label: "Mensaje",
          required: true,
          placeholder: "Escribe tu mensaje aquí...",
          description: "Máximo 500 caracteres",
          size: 12,
        },
      },
    },
  };

  return new ClarifyJS({
    structure,
    onSubmit: (data) => {
      console.log("Contacto enviado:", data);
      alert("¡Mensaje enviado! Ver consola.");
    },
  });
}

// ==================== EJEMPLO 3: FORMULARIO CON DIRECCIÓN ====================
export function addressFormExample() {
  const addressSchema = z.object({
    fullName: z.string().min(3, "Nombre muy corto"),
    address: z.object({
      street: z.string().min(5, "Dirección inválida"),
      number: z.number().int().positive("Número inválido"),
      city: z.string().min(2, "Ciudad inválida"),
      state: z.string().min(2, "Estado inválido"),
      zipCode: z.number().int().min(10000).max(99999, "Código postal inválido"),
    }),
    phone: z.string().regex(/^\d{10}$/, "Teléfono debe tener 10 dígitos"),
  });

  return ClarifyJS.fromSchema(addressSchema, {
    labels: {
      fullName: "Nombre Completo",
      address: "Dirección de Envío",
      street: "Calle",
      number: "Número",
      city: "Ciudad",
      state: "Estado",
      zipCode: "Código Postal",
      phone: "Teléfono",
    },
    onSubmit: (data) => {
      console.log("Dirección guardada:", data);
      alert("¡Dirección guardada! Ver consola.");
    },
  });
}

// ==================== EJEMPLO 4: FORMULARIO DE PRODUCTO ====================
export function productFormExample() {
  const productSchema = z.object({
    productName: z.string().min(3, "Nombre muy corto").max(100),
    description: z.string().max(500, "Descripción muy larga").optional(),
    price: z.number().min(0.01, "Precio debe ser mayor a 0"),
    category: z.enum(["Electrónica", "Ropa", "Hogar", "Deportes", "Juguetes"]),
    stock: z.number().int().min(0, "Stock no puede ser negativo"),
    isActive: z.boolean(),
    discount: z.number().min(0).max(100, "Descuento entre 0 y 100").optional(),
  });

  return ClarifyJS.fromSchema(productSchema, {
    labels: {
      productName: "Nombre del Producto",
      description: "Descripción",
      price: "Precio ($)",
      category: "Categoría",
      stock: "Stock Disponible",
      isActive: "Producto Activo",
      discount: "Descuento (%)",
    },
    onSubmit: (data) => {
      console.log("Producto creado:", data);
      alert("¡Producto creado! Ver consola.");
    },
  });
}

// ==================== EJEMPLO 5: FORMULARIO DE PERFIL DE USUARIO ====================
export function userProfileExample() {
  const profileSchema = z.object({
    username: z.string()
      .min(3, "Mínimo 3 caracteres")
      .max(20, "Máximo 20 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
    email: z.string().email("Email inválido"),
    bio: z.string().max(500, "Biografía muy larga").optional(),
    website: z.string().url("URL inválida").optional(),
    socialMedia: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
    }),
    preferences: z.object({
      newsletter: z.boolean(),
      notifications: z.boolean(),
      publicProfile: z.boolean(),
    }),
  });

  return ClarifyJS.fromSchema(profileSchema, {
    labels: {
      username: "Nombre de Usuario",
      email: "Email",
      bio: "Biografía",
      website: "Sitio Web",
      socialMedia: "Redes Sociales",
      twitter: "Twitter",
      github: "GitHub",
      linkedin: "LinkedIn",
      preferences: "Preferencias",
      newsletter: "Recibir newsletter",
      notifications: "Notificaciones por email",
      publicProfile: "Perfil público",
    },
    onSubmit: (data) => {
      console.log("Perfil actualizado:", data);
      alert("¡Perfil actualizado! Ver consola.");
    },
    onChange: (data, errors) => {
      console.log("Cambio detectado:", { data, errors });
    },
  });
}

// ==================== EJEMPLO 6: FORMULARIO CON VALIDACIONES CUSTOM ====================
export function customValidationExample() {
  const passwordSchema = z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

  const customSchema = z.object({
    email: z.string().email("Email inválido"),
    password: passwordSchema,
    username: z.string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, "Solo alfanuméricos y guión bajo"),
    age: z.number()
      .min(13, "Debes tener al menos 13 años")
      .max(120, "Edad inválida"),
    website: z.string().url("URL inválida").or(z.literal("")),
  });

  return ClarifyJS.fromSchema(customSchema, {
    labels: {
      email: "Correo Electrónico",
      password: "Contraseña Segura",
      username: "Nombre de Usuario",
      age: "Edad",
      website: "Sitio Web (opcional)",
    },
    onSubmit: (data) => {
      console.log("Validación exitosa:", data);
      alert("¡Todas las validaciones pasaron! Ver consola.");
    },
  });
}

// ==================== EJEMPLO 7: FORMULARIO MANUAL CON ESTRUCTURA JSON ====================
export function manualStructureExample() {
  const structure: Structure = {
    header: {
      type: "section",
      label: "📋 Información del Proyecto",
      children: {
        projectName: {
          type: "text",
          label: "Nombre del Proyecto",
          placeholder: "Mi Proyecto Increíble",
          required: true,
          description: "Nombre descriptivo para tu proyecto",
          size: 8,
        },
        projectId: {
          type: "text",
          label: "ID",
          size: 4,
          properties: {
            disabled: true,
          },
        },
      },
    },
    details: {
      type: "box",
      label: "📝 Detalles",
      children: {
        description: {
          type: "textarea",
          label: "Descripción",
          placeholder: "Describe tu proyecto...",
          required: true,
          size: 12,
        },
        priority: {
          type: "select",
          label: "Prioridad",
          required: true,
          size: 6,
          properties: {
            options: [
              { value: "low", label: "Baja" },
              { value: "medium", label: "Media" },
              { value: "high", label: "Alta" },
              { value: "critical", label: "Crítica" },
            ],
          },
        },
        estimatedHours: {
          type: "number",
          label: "Horas Estimadas",
          required: true,
          size: 6,
          properties: {
            min: 1,
            max: 1000,
          },
        },
      },
    },
    flags: {
      type: "section",
      label: "⚙️ Opciones",
      children: {
        isPublic: {
          type: "checkbox",
          label: "Proyecto Público",
          size: 4,
        },
        allowCollaboration: {
          type: "checkbox",
          label: "Permitir Colaboración",
          size: 4,
        },
        sendNotifications: {
          type: "checkbox",
          label: "Enviar Notificaciones",
          size: 4,
        },
      },
    },
  };

  return new ClarifyJS({
    structure,
    onSubmit: (data) => {
      console.log("Proyecto creado:", data);
      alert("¡Proyecto creado! Ver consola.");
    },
    onChange: (data, errors) => {
      console.log("Actualización:", { data, errors });
    },
  });
}
