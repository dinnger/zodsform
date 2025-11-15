import type { ComponentConfig, RenderConfig } from '../interface'

/**
 * Componente de Checkbox personalizado
 */
export const CheckboxInput: ComponentConfig = {
	render: (config: RenderConfig) => {
		const wrapper = document.createElement('div')
		wrapper.classList.add('zodsForm-checkbox-wrapper')

		const input = document.createElement('input')
		input.type = 'checkbox'
		input.id = config.fieldPath
		input.name = config.fieldPath
		input.classList.add('zodsForm-checkbox')

		if (config.required) {
			input.required = true
		}

		if (config.properties?.disabled) {
			input.disabled = true
		}

		if (config.value !== undefined) {
			input.checked = Boolean(config.value)
		}

		wrapper.appendChild(input)

		if (config.properties?.placeholder) {
			const textLabel = document.createElement('span')
			textLabel.classList.add('zodsForm-checkbox-label')
			textLabel.textContent = config.properties.placeholder
			wrapper.appendChild(textLabel)
		}

		return wrapper
	},

	getValue: (element: HTMLElement) => {
		return (element as HTMLInputElement).checked
	},

	setValue: (element: HTMLElement, value: any) => {
		;(element as HTMLInputElement).checked = Boolean(value)
	}
}
