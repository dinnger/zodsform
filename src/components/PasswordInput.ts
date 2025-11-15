import type { ComponentConfig, RenderConfig } from '../interface'

/**
 * Componente de Password con toggle show/hide
 */
export const PasswordInput: ComponentConfig = {
	render: (config: RenderConfig) => {
		const wrapper = document.createElement('div')
		wrapper.classList.add('zodsForm-password-wrapper')

		const input = document.createElement('input')
		input.type = 'password'
		input.id = config.fieldPath
		input.name = config.fieldPath
		input.classList.add('zodsForm-input')
		input.style.paddingRight = '40px'

		if (config.properties?.placeholder) {
			input.placeholder = config.properties?.placeholder
		}

		if (config.required) {
			input.required = true
		}

		if (config.properties?.disabled) {
			input.disabled = true
		}

		if (config.value !== undefined) {
			input.value = String(config.value)
		}

		wrapper.appendChild(input)

		// Toggle button
		if (config.isPassword) {
			const toggleButton = document.createElement('button')
			toggleButton.type = 'button'
			toggleButton.classList.add('zodsForm-password-toggle')
			toggleButton.innerHTML = `
        <svg class="eye-open" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        <svg class="eye-closed" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
        </svg>
      `

			toggleButton.addEventListener('click', () => {
				const isPassword = input.type === 'password'
				input.type = isPassword ? 'text' : 'password'

				const openEye = toggleButton.querySelector('.eye-open') as HTMLElement
				const closedEye = toggleButton.querySelector('.eye-closed') as HTMLElement

				if (isPassword) {
					openEye.style.display = 'none'
					closedEye.style.display = 'block'
				} else {
					openEye.style.display = 'block'
					closedEye.style.display = 'none'
				}
			})

			wrapper.appendChild(toggleButton)
		}

		return wrapper
	},

	getValue: (element: HTMLElement) => {
		const input = element.querySelector('input') || element
		return (input as HTMLInputElement).value
	},

	setValue: (element: HTMLElement, value: any) => {
		const input = element.querySelector('input') || element
		;(input as HTMLInputElement).value = String(value)
	}
}
