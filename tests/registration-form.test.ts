import { beforeEach, describe, expect, test } from 'vitest'

describe('Formulario de Registro - Validaciones', () => {
	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

	const triggerInput = (element: HTMLElement) => {
		element.dispatchEvent(new Event('input', { bubbles: true }))
	}

	const triggerBlur = (element: HTMLElement) => {
		element.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
	}

	const triggerChange = (element: HTMLElement) => {
		element.dispatchEvent(new Event('change', { bubbles: true }))
	}

	const getSubmitButtonState = () => {
		const button = document.querySelector('button[type="submit"]') as HTMLButtonElement
		return { button, isDisabled: button?.disabled ?? true }
	}

	const fillBaseForm = (overrides: Record<string, any> = {}) => {
		const defaults = {
			firstName: '',
			lastName: '',
			email: 'test@example.com',
			password: 'Password123!',
			confirmPassword: 'Password123!',
			country: '',
			zipCode: '12345',
			acceptTerms: true,
			age: ''
		}

		const values = { ...defaults, ...overrides }

		const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement
		if (firstNameInput && values.firstName !== undefined) {
			firstNameInput.value = values.firstName
			triggerInput(firstNameInput)
		}

		const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement
		if (lastNameInput && values.lastName !== undefined) {
			lastNameInput.value = values.lastName
			triggerInput(lastNameInput)
		}

		const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
		if (emailInput) {
			emailInput.value = values.email
			triggerInput(emailInput)
		}

		const passwordInput = document.querySelector('input[name="security.password"]') as HTMLInputElement
		if (passwordInput) {
			passwordInput.value = values.password
			triggerInput(passwordInput)
		}

		const confirmPasswordInput = document.querySelector('input[name="security.confirmPassword"]') as HTMLInputElement
		if (confirmPasswordInput) {
			confirmPasswordInput.value = values.confirmPassword
			triggerInput(confirmPasswordInput)
		}

		const countrySelect = document.querySelector('select[name="country"]') as HTMLSelectElement
		if (countrySelect) {
			countrySelect.value = values.country
			triggerChange(countrySelect)
		}

		const zipCodeInput = document.querySelector('input[name="zipCode"]') as HTMLInputElement
		if (zipCodeInput) {
			zipCodeInput.value = values.zipCode
			triggerInput(zipCodeInput)
			zipCodeInput.setAttribute('data-raw-value', values.zipCode)
		}

		const termsCheckbox = document.querySelector('input[name="acceptTerms"]') as HTMLInputElement
		if (termsCheckbox && values.acceptTerms !== undefined) {
			termsCheckbox.checked = values.acceptTerms
			triggerChange(termsCheckbox)
		}

		if (values.age !== '' && values.age !== undefined) {
			const ageInput = document.querySelector('input[name="age"]') as HTMLInputElement
			if (ageInput) {
				ageInput.value = values.age
				triggerInput(ageInput)
			}
		}
	}

	beforeEach(async () => {
		document.body.innerHTML = '<div id="app"></div>'
		const { registrationFormExample } = await import('../src/examples')
		const form = registrationFormExample()
		const appDiv = document.getElementById('app')
		if (appDiv) {
			appDiv.appendChild(form.render())

			// Crear y añadir botón de submit
			const submitButton = document.createElement('button')
			submitButton.type = 'submit'
			submitButton.disabled = true // Inicialmente deshabilitado
			submitButton.className =
				'zodsForm-submit bg-blue-500 text-white px-6 py-3 border-none rounded-md text-base font-semibold cursor-pointer transition-all w-full mt-2.5 hover:bg-blue-600 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none'
			submitButton.textContent = 'Submit'

			// Añadir el botón al formulario
			const formElement = appDiv.querySelector('form')
			if (formElement) {
				formElement.appendChild(submitButton)
			}

			;(window as any).updateSubmitButton = (isValid: boolean) => {
				if (submitButton) {
					submitButton.disabled = !isValid
				}
			}
		}
		await wait(300)
	})

	test('Caso 1: Campos parciales - Botón desactivado', async () => {
		fillBaseForm({
			email: 'partial@test.com',
			password: 'Pass123!',
			confirmPassword: 'Pass123!',
			zipCode: '',
			acceptTerms: false
		})
		await wait(500)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(true)
	})

	test('Caso 2: Completo sin nombre/apellido, contraseñas iguales - Botón activo', async () => {
		fillBaseForm({
			firstName: '',
			lastName: '',
			email: 'complete@test.com',
			password: 'ValidPass123!',
			confirmPassword: 'ValidPass123!',
			country: 'mx',
			zipCode: '54321',
			acceptTerms: true
		})
		const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
		if (emailInput) triggerBlur(emailInput)
		await wait(500)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(false)
	})

	test('Caso 3: Completo sin nombre/apellido, contraseñas diferentes - Botón inactivo', async () => {
		fillBaseForm({
			firstName: '',
			lastName: '',
			email: 'mismatch@test.com',
			password: 'Password123!',
			confirmPassword: 'DifferentPass456!',
			country: 'us',
			zipCode: '99999',
			acceptTerms: true
		})
		const confirmPasswordInput = document.querySelector('input[name="security.confirmPassword"]') as HTMLInputElement
		if (confirmPasswordInput) triggerBlur(confirmPasswordInput)
		await wait(500)
		const errorContainer = document.querySelector('[data-error-for="security.confirmPassword"]')
		expect(errorContainer?.textContent).toMatch(/las contraseñas no coinciden/i)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(true)
	})

	test('Caso 4: Con nombre y edad inválida - Botón inactivo', async () => {
		fillBaseForm({
			firstName: 'Juan',
			lastName: 'Pérez',
			email: 'invalid-age@test.com',
			password: 'SecurePass123!',
			confirmPassword: 'SecurePass123!',
			country: 'es',
			zipCode: '11111',
			acceptTerms: true
		})
		await wait(500)
		const ageInput = document.querySelector('input[name="age"]') as HTMLInputElement
		if (ageInput) {
			ageInput.value = '15'
			triggerInput(ageInput)
			triggerBlur(ageInput)
		}
		await wait(500)
		const errorContainer = document.querySelector('[data-error-for="age"]')
		expect(errorContainer?.textContent).toMatch(/debes ser mayor de edad/i)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(true)
	})

	test('Caso 5: Con nombre y edad válida - Botón activo', async () => {
		fillBaseForm({
			firstName: 'María',
			lastName: 'González',
			email: 'valid-age@test.com',
			password: 'StrongPass123!',
			confirmPassword: 'StrongPass123!',
			country: 'ar',
			zipCode: '22222',
			acceptTerms: true
		})
		await wait(500)
		const ageInput = document.querySelector('input[name="age"]') as HTMLInputElement
		if (ageInput) {
			ageInput.value = '25'
			triggerInput(ageInput)
			triggerBlur(ageInput)
		}
		await wait(500)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(false)
	})

	test('Caso 6: Refine con campo oculto - Edad oculta pero refine funciona', async () => {
		fillBaseForm({
			firstName: '',
			lastName: '',
			email: 'hidden-field@test.com',
			password: 'Password123!',
			confirmPassword: 'WrongPass456!',
			country: 'mx',
			zipCode: '33333',
			acceptTerms: true
		})
		const confirmPasswordInput = document.querySelector('input[name="security.confirmPassword"]') as HTMLInputElement
		if (confirmPasswordInput) triggerBlur(confirmPasswordInput)
		await wait(500)
		const ageField = document.querySelector('[data-field="age"]') as HTMLElement
		const ageIsVisible = ageField && ageField.style.display !== 'none'
		expect(ageIsVisible).toBe(false)
		const errorContainer = document.querySelector('[data-error-for="security.confirmPassword"]')
		expect(errorContainer?.textContent).toMatch(/las contraseñas no coinciden/i)
		const { isDisabled } = getSubmitButtonState()
		expect(isDisabled).toBe(true)
	})
})
