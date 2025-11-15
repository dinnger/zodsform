import type { ComponentConfig, RenderConfig } from '../interface'
/**
 * Componente de Input de texto estándar
 */
export const TextInput: ComponentConfig = {
	render: (config: RenderConfig) => {
		const input = document.createElement('input')
		input.type = config.type
		input.id = config.fieldPath
		input.name = config.fieldPath
		input.classList.add('zodsForm-input')

		if (config.properties?.placeholder) {
			input.placeholder = config.properties?.placeholder
		}

		if (config.required) {
			input.required = true
		}

		if (config.properties?.disabled) {
			input.disabled = true
		}

		if (config.properties?.min !== undefined) {
			input.min = String(config.properties.min)
		}

		if (config.properties?.max !== undefined) {
			input.max = String(config.properties.max)
		}

		if (config.value !== undefined) {
			input.value = String(config.value)
		}

		return input
	},

	getValue: (element: HTMLElement) => {
		return (element as HTMLInputElement).value
	},

	setValue: (element: HTMLElement, value: any) => {
		;(element as HTMLInputElement).value = String(value)
	}
}
