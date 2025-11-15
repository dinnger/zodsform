import type { ComponentConfig, RenderConfig } from '../interface'

/**
 * Componente de Textarea
 */
export const TextArea: ComponentConfig = {
	render: (config: RenderConfig) => {
		const textarea = document.createElement('textarea')
		textarea.id = config.fieldPath
		textarea.name = config.fieldPath
		textarea.classList.add('zodsForm-textarea')

		if (config.properties?.placeholder) {
			textarea.placeholder = config.properties?.placeholder
		}

		if (config.required) {
			textarea.required = true
		}

		if (config.properties?.disabled) {
			textarea.disabled = true
		}

		if (config.value !== undefined) {
			textarea.value = String(config.value)
		}

		return textarea
	},

	getValue: (element: HTMLElement) => {
		return (element as HTMLTextAreaElement).value
	},

	setValue: (element: HTMLElement, value: any) => {
		;(element as HTMLTextAreaElement).value = String(value)
	}
}
