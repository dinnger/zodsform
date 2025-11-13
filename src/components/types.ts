/**
 * Tipos para componentes personalizados de ClarifyJS
 */

export interface ComponentConfig {
  /** Clases CSS base para el input/componente */
  baseClasses?: string[];
  /** Función que genera el HTML del componente */
  render: (config: RenderConfig) => HTMLElement;
  /** Función opcional para extraer el valor del componente */
  getValue?: (element: HTMLElement) => any;
  /** Función opcional para establecer el valor del componente */
  setValue?: (element: HTMLElement, value: any) => void;
}

export interface RenderConfig {
  /** Path del campo en el formulario */
  fieldPath: string;
  /** Tipo de campo */
  type: string;
  /** Propiedades del campo */
  properties?: {
    disabled?: boolean;
    min?: number;
    max?: number;
    options?: Array<{ value: string | number; label: string }>;
    [key: string]: any;
  } | undefined;
  /** Valor actual del campo */
  value?: any;
  /** Si el campo es requerido */
  required?: boolean | undefined;
  /** Placeholder del campo */
  placeholder?: string | undefined;
  /** Máscara del campo */
  mask?: string | RegExp | undefined;
  /** Si es un campo password */
  isPassword?: boolean | undefined;
}
