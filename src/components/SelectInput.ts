import type { ComponentConfig, RenderConfig } from '../interface'

/**
 * Componente de Select (dropdown)
 */
export const SelectInput: ComponentConfig = {
	render: (config: RenderConfig) => {
		const select = document.createElement('select')
		select.id = config.fieldPath
		select.name = config.fieldPath
		select.classList.add('zodsForm-select')

		if (config.required) {
			select.required = true
		}

		if (config.properties?.disabled) {
			select.disabled = true
		}

		if (config.properties?.options) {
			config.properties.options.forEach((opt) => {
				const option = document.createElement('option')
				option.value = String(opt.value)
				option.textContent = opt.label
				select.appendChild(option)
			})
		}

		if (config.value !== undefined) {
			select.value = String(config.value)
		} else {
			;(select as any).value = undefined
		}

		return select
	},

	getValue: (element: HTMLElement) => {
		return (element as HTMLSelectElement).value
	},

	setValue: (element: HTMLElement, value: any) => {
		;(element as HTMLSelectElement).value = String(value)
	}
}
