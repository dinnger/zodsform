import { z, ZodType, ZodTypeDef } from "zod";

// ==================== TIPOS ====================
type Structure = {
  [key: string]: StructureItem;
};

interface StructureItem {
  type: "text" | "number" | "email" | "password" | "textarea" | "select" | "checkbox" | "section" | "box";
  label?: string;
  size?: number; // default 12 (grid system)
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

interface FormConfig {
  structure: Structure;
  schema?: z.ZodObject<any> | undefined;
  onSubmit?: ((data: any) => void) | undefined;
  onChange?: ((data: any, errors: any) => void) | undefined;
}


// ==================== ZOD  ====================
ZodType.prototype.label = function(label: string) {
  // 'this.constructor' es la clase específica (ZodString, ZodObject, etc.)
  const C = this.constructor as any; 
  
  // Retornamos una nueva instancia del esquema con la nueva propiedad 'label' en su _def
  return new C({
    ...this._def,
    label: label, // Aquí guardamos nuestro label
  });
};

declare module 'zod' {
  // Añadimos 'label' a la definición base que todos los esquemas usan
  interface ZodTypeDef {
    label?: string;
    style?:{size:number, class:string}
  }

  // Añadimos el método .label() a la clase base ZodType
  // 'this' asegura que el encadenamiento (chaining) siga funcionando
  interface ZodType {
    /** Define a label for the schema */
    label(label: string): this;
  }
}



// ==================== UTILIDADES ZOD ====================
class ZodExtractor {
  /**
   * Extrae información de validación desde un esquema Zod
   */
  static extractValidationInfo(zodSchema: z.ZodTypeAny): any {
    const info: any = {
      required: !zodSchema.isOptional(),
      type: (zodSchema as any)._def.typeName,
    };

    // ZodString
    if (zodSchema instanceof z.ZodString) {
      const checks = (zodSchema as any)._def.checks || [];
      checks.forEach((check: any) => {
        switch (check.kind) {
          case "min":
            info.minLength = check.value;
            break;
          case "max":
            info.maxLength = check.value;
            break;
          case "email":
            info.isEmail = true;
            break;
          case "url":
            info.isUrl = true;
            break;
          case "regex":
            info.pattern = check.regex;
            break;
        }
      });
    }

    // ZodNumber
    if (zodSchema instanceof z.ZodNumber) {
      const checks = (zodSchema as any)._def.checks || [];
      checks.forEach((check: any) => {
        switch (check.kind) {
          case "min":
            info.min = check.value;
            info.minInclusive = check.inclusive;
            break;
          case "max":
            info.max = check.value;
            info.maxInclusive = check.inclusive;
            break;
          case "int":
            info.isInt = true;
            break;
        }
      });
    }

    // ZodEnum
    if (zodSchema instanceof z.ZodEnum) {
      info.options = (zodSchema as any)._def.values;
    }

    // ZodObject (para objetos anidados)
    if (zodSchema instanceof z.ZodObject) {
      info.shape = (zodSchema as any)._def.shape;
    }

    // ZodOptional
    if (zodSchema instanceof z.ZodOptional) {
      info.required = false;
      return { ...info, ...this.extractValidationInfo((zodSchema as any)._def.innerType) };
    }

    return info;
  }

  /**
   * Genera estructura de formulario desde un esquema Zod
   */
  static schemaToStructure(
    zodSchema: z.ZodObject<any>,
    labels?: Record<string, string>
  ): Structure {
    const structure: Structure = {};
    const shape = zodSchema._def.shape;

    for (const [key, value] of Object.entries(shape)) {
      const zodType = value as z.ZodTypeAny;
      const validationInfo = this.extractValidationInfo(zodType);

      const item: StructureItem = {
        type: this.inferInputType(validationInfo),
        label: labels?.[key] || this.formatLabel(key),
        required: validationInfo.required,
        validation: zodType,
      };

      // Configurar propiedades según el tipo
      if (validationInfo.minLength) {
        item.properties = { ...item.properties, min: validationInfo.minLength };
      }
      if (validationInfo.maxLength) {
        item.properties = { ...item.properties, max: validationInfo.maxLength };
      }
      if (validationInfo.min !== undefined) {
        item.properties = { ...item.properties, min: validationInfo.min };
      }
      if (validationInfo.max !== undefined) {
        item.properties = { ...item.properties, max: validationInfo.max };
      }
      if (validationInfo.options) {
        item.type = "select";
        item.properties = {
          ...item.properties,
          options: validationInfo.options.map((opt: any) => ({
            value: opt,
            label: opt,
          })),
        };
      }

      // Objetos anidados
      if (validationInfo.shape) {
        item.type = "box";
        item.children = this.schemaToStructure(
          z.object(validationInfo.shape),
          labels
        );
      }

      structure[key] = item;
    }

    return structure;
  }

  private static inferInputType(validationInfo: any): StructureItem["type"] {
    if (validationInfo.isEmail) return "email";
    if (validationInfo.type === "ZodNumber") return "number";
    if (validationInfo.type === "ZodBoolean") return "checkbox";
    return "text";
  }

  private static formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}

// ==================== CLARIFYJS - MOTOR DE FORMULARIOS ====================
class ClarifyJS {
  private container: HTMLElement;
  private structure: Structure;
  private schema: z.ZodObject<any> | undefined;
  private formData: Record<string, any> = {};
  private errors: Record<string, string[]> = {};
  private onSubmitCallback: ((data: any) => void) | undefined;
  private onChangeCallback: ((data: any, errors: any) => void) | undefined;

  constructor(config: FormConfig) {
    this.container = document.createElement("form");
    this.container.classList.add("clarifyjs-form");
    this.structure = config.structure;
    this.schema = config.schema;
    this.onSubmitCallback = config.onSubmit;
    this.onChangeCallback = config.onChange;

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  /**
   * Renderiza el formulario
   */
  render(): HTMLElement {
    this.container.innerHTML = "";
    const fieldsContainer = this.renderStructure(this.structure);
    this.container.appendChild(fieldsContainer);

    // Botón de submit
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit";
    submitButton.classList.add("clarifyjs-submit");
    this.container.appendChild(submitButton);

    return this.container;
  }

  /**
   * Renderiza una estructura de forma recursiva
   */
  private renderStructure(
    structure: Structure,
    parentPath: string = ""
  ): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("clarifyjs-grid");

    for (const [key, item] of Object.entries(structure)) {
      const fieldPath = parentPath ? `${parentPath}.${key}` : key;
      const element = this.renderField(key, item, fieldPath);
      
      if (item.size) {
        element.style.gridColumn = `span ${item.size}`;
      }
      
      container.appendChild(element);
    }

    return container;
  }

  /**
   * Renderiza un campo individual
   */
  private renderField(
    _key: string,
    item: StructureItem,
    fieldPath: string
  ): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.classList.add("clarifyjs-field");
    wrapper.setAttribute("data-type", item.type);
    wrapper.setAttribute("data-field", fieldPath);

    // Contenedores especiales
    if (item.type === "section" || item.type === "box") {
      if (item.label) {
        const title = document.createElement("h3");
        title.classList.add("clarifyjs-section-title");
        title.textContent = item.label;
        wrapper.appendChild(title);
      }

      if (item.children) {
        const childrenContainer = this.renderStructure(item.children, fieldPath);
        wrapper.appendChild(childrenContainer);
      }

      return wrapper;
    }

    // Label
    if (item.label) {
      const label = document.createElement("label");
      label.htmlFor = fieldPath;
      label.textContent = item.label;
      if (item.required) {
        label.innerHTML += ' <span class="required">*</span>';
      }
      wrapper.appendChild(label);
    }

    // Input
    const input = this.createInput(item, fieldPath);
    wrapper.appendChild(input);

    // Descripción
    if (item.description) {
      const desc = document.createElement("small");
      desc.classList.add("clarifyjs-description");
      desc.textContent = item.description;
      wrapper.appendChild(desc);
    }

    // Error container
    const errorContainer = document.createElement("div");
    errorContainer.classList.add("clarifyjs-error");
    errorContainer.setAttribute("data-error-for", fieldPath);
    wrapper.appendChild(errorContainer);

    return wrapper;
  }

  /**
   * Crea el input apropiado según el tipo
   */
  private createInput(item: StructureItem, fieldPath: string): HTMLElement {
    let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    switch (item.type) {
      case "textarea":
        input = document.createElement("textarea");
        break;
      case "select":
        input = document.createElement("select");
        if (item.properties?.options) {
          item.properties.options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = String(opt.value);
            option.textContent = opt.label;
            (input as HTMLSelectElement).appendChild(option);
          });
        }
        break;
      case "checkbox":
        input = document.createElement("input");
        input.type = "checkbox";
        break;
      default:
        input = document.createElement("input");
        input.type = item.type;
    }

    input.id = fieldPath;
    input.name = fieldPath;

    if (item.placeholder && 'placeholder' in input) {
      input.placeholder = item.placeholder;
    }

    if (item.required) {
      input.required = true;
    }

    if (item.properties?.disabled) {
      input.disabled = true;
    }

    if (item.properties?.min !== undefined && input instanceof HTMLInputElement) {
      input.min = String(item.properties.min);
    }

    if (item.properties?.max !== undefined && input instanceof HTMLInputElement) {
      input.max = String(item.properties.max);
    }

    // Event listener para validación en tiempo real
    input.addEventListener("input", () => {
      this.handleFieldChange(fieldPath, input, item);
    });

    input.addEventListener("blur", () => {
      this.validateField(fieldPath, item);
    });

    return input;
  }

  /**
   * Maneja cambios en un campo
   */
  private handleFieldChange(
    fieldPath: string,
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    item: StructureItem
  ) {
    let value: any;

    if (input instanceof HTMLInputElement && input.type === "checkbox") {
      value = input.checked;
    } else if (item.type === "number") {
      value = input.value ? Number(input.value) : undefined;
    } else {
      value = input.value;
    }

    this.setNestedValue(this.formData, fieldPath, value);
    
    if (this.onChangeCallback) {
      this.onChangeCallback(this.formData, this.errors);
    }
  }

  /**
   * Valida un campo específico
   */
  private validateField(fieldPath: string, item: StructureItem) {
    if (!item.validation) return;

    const value = this.getNestedValue(this.formData, fieldPath);
    const result = item.validation.safeParse(value);

    const errorContainer = this.container.querySelector(
      `[data-error-for="${fieldPath}"]`
    );

    if (!result.success) {
      const errors = JSON.parse(result.error.toString()).map((e: any) => e.message);
      this.errors[fieldPath] = errors;

      if (errorContainer) {
        errorContainer.textContent = errors.join(", ");
        errorContainer.classList.add("visible");
      }

      const field = this.container.querySelector(`[data-field="${fieldPath}"]`);
      field?.classList.add("has-error");
    } else {
      delete this.errors[fieldPath];

      if (errorContainer) {
        errorContainer.textContent = "";
        errorContainer.classList.remove("visible");
      }

      const field = this.container.querySelector(`[data-field="${fieldPath}"]`);
      field?.classList.remove("has-error");
    }
  }

  /**
   * Maneja el submit del formulario
   */
  private handleSubmit() {
    // Validar todos los campos
    this.validateAllFields(this.structure);

    // Si hay errores, no enviar
    if (Object.keys(this.errors).length > 0) {
      console.error("Errores de validación:", this.errors);
      return;
    }

    // Validar con el schema completo si existe
    if (this.schema) {
      const result = this.schema.safeParse(this.formData);

      if (!result.success) {
        console.error("Errores de validación del schema:", result.error);
        this.displaySchemaErrors(result.error);
        return;
      }
    }

    // Enviar datos
    if (this.onSubmitCallback) {
      this.onSubmitCallback(this.formData);
    }
  }

  /**
   * Valida todos los campos recursivamente
   */
  private validateAllFields(structure: Structure, parentPath: string = "") {
    for (const [key, item] of Object.entries(structure)) {
      const fieldPath = parentPath ? `${parentPath}.${key}` : key;

      if (item.children) {
        this.validateAllFields(item.children, fieldPath);
      } else if (item.validation) {
        this.validateField(fieldPath, item);
      }
    }
  }

  /**
   * Muestra errores del schema completo
   */
  private displaySchemaErrors(error: z.ZodError) {
    (error as any).errors.forEach((err: any) => {
      const fieldPath = err.path.join(".");
      const errorContainer = this.container.querySelector(
        `[data-error-for="${fieldPath}"]`
      );

      if (errorContainer) {
        errorContainer.textContent = err.message;
        errorContainer.classList.add("visible");
      }

      const field = this.container.querySelector(`[data-field="${fieldPath}"]`);
      field?.classList.add("has-error");
    });
  }

  /**
   * Obtiene un valor anidado usando un path con puntos
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Establece un valor anidado usando un path con puntos
   */
  private setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Obtiene los datos del formulario
   */
  getData(): any {
    return { ...this.formData };
  }

  /**
   * Obtiene los errores del formulario
   */
  getErrors(): any {
    return { ...this.errors };
  }

  /**
   * Establece valores en el formulario
   */
  setData(data: Record<string, any>) {
    this.formData = { ...data };
    this.populateForm(data);
  }

  /**
   * Puebla el formulario con datos
   */
  private populateForm(data: Record<string, any>, prefix: string = "") {
    for (const [key, value] of Object.entries(data)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const input = this.container.querySelector(
        `[name="${fieldPath}"]`
      ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

      if (input) {
        if (input instanceof HTMLInputElement && input.type === "checkbox") {
          input.checked = Boolean(value);
        } else {
          input.value = String(value);
        }
      } else if (typeof value === "object" && value !== null) {
        this.populateForm(value, fieldPath);
      }
    }
  }

  /**
   * Método estático para crear formulario desde schema Zod
   */
  static fromSchema(
    schema: z.ZodObject<any>,
    config?: {
      labels?: Record<string, string>;
      onSubmit?: (data: any) => void;
      onChange?: (data: any, errors: any) => void;
    }
  ): ClarifyJS {
    const structure = ZodExtractor.schemaToStructure(schema, config?.labels);
    return new ClarifyJS({
      structure,
      schema,
      onSubmit: config?.onSubmit,
      onChange: config?.onChange,
    });
  }
}

// ==================== EJEMPLO DE USO ====================

// Esquema Zod de ejemplo
const userSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Debes ser mayor de edad").max(120),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.number().int(),
  }),
});

// Crear formulario desde el schema
const form = ClarifyJS.fromSchema(userSchema, {
  labels: {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    age: "Edad",
    address: "Dirección",
    street: "Calle",
    city: "Ciudad",
    state: "Estado",
    zip: "Código Postal",
  },
  onSubmit: (data) => {
    console.log("Formulario enviado:", data);
    alert("Formulario válido! Ver consola para datos");
  },
  onChange: (data, errors) => {
    console.log("Datos actuales:", data);
    console.log("Errores:", errors);
  },
});

// Renderizar
const root = document.getElementById("root");
if (root) {
  root.appendChild(form.render());
}

// También puedes exportar para usar como librería
export { ClarifyJS, ZodExtractor, z };
export type { Structure, StructureItem, FormConfig };