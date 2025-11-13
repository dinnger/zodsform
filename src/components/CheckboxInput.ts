import type { ComponentConfig, RenderConfig } from './types';

/**
 * Componente de Checkbox personalizado
 */
export const CheckboxInput: ComponentConfig = {
  baseClasses: [
    "w-auto", "h-[18px]", "cursor-pointer", "rounded", 
    "border-gray-300", "text-blue-600", 
    "focus:ring-2", "focus:ring-blue-500"
  ],
  
  render: (config: RenderConfig) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = config.fieldPath;
    input.name = config.fieldPath;
    input.classList.add(...(CheckboxInput.baseClasses || []));

    if (config.required) {
      input.required = true;
    }

    if (config.properties?.disabled) {
      input.disabled = true;
      input.classList.add("cursor-not-allowed", "opacity-60");
    }

    if (config.value !== undefined) {
      input.checked = Boolean(config.value);
    }

    return input;
  },

  getValue: (element: HTMLElement) => {
    return (element as HTMLInputElement).checked;
  },

  setValue: (element: HTMLElement, value: any) => {
    (element as HTMLInputElement).checked = Boolean(value);
  }
};
