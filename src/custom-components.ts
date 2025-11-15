import type { ComponentConfig } from './interface'

/**
 * Componente Toggle Switch personalizado para campos booleanos
 */
export const ToggleSwitch: ComponentConfig = {
	render: (config) => {
		const wrapper = document.createElement('div')
		wrapper.classList.add('zodsForm-toggle-wrapper')

		// Input checkbox oculto
		const input = document.createElement('input')
		input.type = 'checkbox'
		input.id = config.fieldPath
		input.name = config.fieldPath
		input.style.position = 'absolute'
		input.style.opacity = '0'
		input.style.width = '0'
		input.style.height = '0'

		if (config.required) {
			input.required = true
		}

		if (config.value !== undefined) {
			input.checked = Boolean(config.value)
		}

		// Toggle visual
		const toggle = document.createElement('button')
		toggle.type = 'button'
		toggle.classList.add('zodsForm-toggle')
		if (input.checked) {
			toggle.classList.add('checked')
		}

		// Circle slider
		const circle = document.createElement('span')
		circle.classList.add('zodsForm-toggle-circle')

		toggle.appendChild(circle)

		// Label para el estado
		const statusLabel = document.createElement('span')
		statusLabel.classList.add('zodsForm-toggle-label')
		statusLabel.textContent = input.checked ? 'Activado' : 'Desactivado'

		// Toggle handler
		toggle.addEventListener('click', () => {
			input.checked = !input.checked
			statusLabel.textContent = input.checked ? 'Activado' : 'Desactivado'

			if (input.checked) {
				toggle.classList.add('checked')
			} else {
				toggle.classList.remove('checked')
			}

			// Disparar evento change para que ZodsForm detecte el cambio
			input.dispatchEvent(new Event('change', { bubbles: true }))
		})

		// Actualizar label cuando cambia
		input.addEventListener('change', () => {
			statusLabel.textContent = input.checked ? 'Activado' : 'Desactivado'
		})

		wrapper.appendChild(input)
		wrapper.appendChild(toggle)
		wrapper.appendChild(statusLabel)

		return wrapper
	},

	getValue: (element: HTMLElement) => {
		const input = element.querySelector('input')
		return input ? input.checked : false
	},

	setValue: (element: HTMLElement, value: any) => {
		const input = element.querySelector('input')
		if (input) {
			input.checked = Boolean(value)
		}
	}
}

/**
 * Componente Checkbox estilizado con icono
 */
export const StyledCheckbox: ComponentConfig = {
	render: (config) => {
		const wrapper = document.createElement('label')
		wrapper.classList.add('flex', 'items-center', 'gap-3', 'cursor-pointer', 'group')

		const checkboxContainer = document.createElement('div')
		checkboxContainer.classList.add('relative', 'flex', 'items-center', 'justify-center')

		const input = document.createElement('input')
		input.type = 'checkbox'
		input.id = config.fieldPath
		input.name = config.fieldPath
		input.classList.add('zodsForm-styled-checkbox')

		if (config.required) {
			input.required = true
		}

		if (config.value !== undefined) {
			input.checked = Boolean(config.value)
		}

		// Box visual
		const box = document.createElement('div')
		box.classList.add('zodsForm-styled-checkbox-box')

		// Check icon (SVG)
		const checkIcon = document.createElement('svg')
		checkIcon.classList.add('zodsForm-styled-checkbox-check')
		checkIcon.setAttribute('width', '16')
		checkIcon.setAttribute('height', '16')
		checkIcon.setAttribute('fill', 'none')
		checkIcon.setAttribute('stroke', 'currentColor')
		checkIcon.setAttribute('viewBox', '0 0 24 24')
		checkIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>'

		box.appendChild(checkIcon)

		checkboxContainer.appendChild(input)
		checkboxContainer.appendChild(box)

		wrapper.appendChild(checkboxContainer)

		if (config.properties?.placeholder) {
			const textLabel = document.createElement('span')
			textLabel.classList.add('zodsForm-checkbox-label')
			textLabel.style.marginLeft = '8px'
			textLabel.textContent = config.properties?.placeholder
			wrapper.appendChild(textLabel)
		}

		return wrapper
	},

	getValue: (element: HTMLElement) => {
		const input = element.querySelector('input')
		return input ? input.checked : false
	},

	setValue: (element: HTMLElement, value: any) => {
		const input = element.querySelector('input')
		if (input) {
			input.checked = Boolean(value)
		}
	}
}
