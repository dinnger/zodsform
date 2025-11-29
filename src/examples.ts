import { ZodsForm, z } from './index'

// ==================== EJEMPLO 1: FORMULARIO DE REGISTRO ====================
export function registrationFormExample() {
	const registrationSchema = z
		.object({
			firstName: z.string('El nombre es obligatorio').min(2, 'Mínimo 2 caracteres').label('First Name').properties({ size: 6 }).optional(),
			lastName: z.string().min(2, 'Mínimo 2 caracteres').label('Last Name').properties({ size: 6 }).optional(),
			email: z.string().email('Email inválido').label('Email'),
			security: z
				.object({
					password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').label('Password').password(),
					confirmPassword: z.string().label('Confirm Password').password()
				})
				.label('Security'),
			country: z.enum({ mx: 'Mexico', us: 'USA', es: 'Spain', ar: 'Argentina' }).label('Country'),
			zipCode: z.string().length(5, 'Zip code must be 5 digits').label('Zip Code').properties({ mask: '#####' }),
			acceptTerms: z
				.boolean()
				.properties({
					size: 3,
					placeholder: 'I accept the terms and conditions'
				})
				.refine((data) => data === true, {
					message: 'Debes aceptar los términos y condiciones',
					path: ['acceptTerms']
				}),
			age: z.number().min(18, 'Debes ser mayor de edad').max(120).label('Age').properties({ visible: false })
		})
		.refine((data) => data.security?.password === data.security?.confirmPassword, {
			message: 'Las contraseñas no coinciden',
			path: ['security', 'confirmPassword']
		})

	const form = ZodsForm.fromSchema(registrationSchema, {
		onValidate: ({ isValid }) => {
			// Este callback se puede usar con frameworks reactivos
			// Vue: ref(isValid) / React: setState(isValid) / Angular: signal(isValid)
			// console.log("🔍 Validación ejecutada:", { isValid, data, errors });

			// Actualizar el estado del botón de submit
			if (typeof window !== 'undefined' && (window as any).updateSubmitButton) {
				;(window as any).updateSubmitButton(isValid)
			}

			// Ejemplo de integración con frameworks:
			// Vue 3: formValidSignal.value = isValid
			// React: setFormValid(isValid)
			// Angular: formValidSignal.set(isValid)
		},
		onChange: ({ fieldPath, data }) => {
			// Mostrar/ocultar campo age según firstName tenga valor
			if (fieldPath === 'firstName') {
				if (data.firstName && data.firstName !== '') {
					form.setFieldProperty({ fieldPath: 'age', property: 'visible', value: true })
					form.setData({ fieldPath: 'age', value: 99 })
				} else {
					form.setFieldProperty({ fieldPath: 'age', property: 'visible', value: false })
				}
			}
		},
		onSubmit: ({ data }) => {
			console.log('✅ Registro exitoso:', data)
			alert('¡Registro exitoso! Ver consola.')
		}
	})

	// form.setData({ fieldPath: 'firstName', value: 'Juan' }) // Commented out for testing - tests expect clean form state

	return form
}

// ==================== EJEMPLO 7: FORMULARIO CON MÁSCARAS ====================
export function masksExample() {
	const masksSchema = z.object({
		phone: z.string().length(10, 'Teléfono debe tener 10 dígitos').label('Teléfono').properties({ mask: '###-###-####' }),

		accountNumber: z
			.string()
			.regex(/^[1-6]\d{0,5}$/, 'Debe iniciar con 1-6 y máximo 6 dígitos')
			.label('Número de cuenta (1-6 + hasta 5 dígitos)')
			.properties({ mask: /^[1-6]\d{0,5}$/ }),

		zipCode: z.string().length(5, 'Código postal debe ser 5 dígitos').label('Código Postal').properties({ mask: '#####' }),

		creditCard: z
			.string()
			.length(16, 'Tarjeta debe tener 16 dígitos')
			.label('Tarjeta de Crédito')
			.properties({ mask: '####-####-####-####' }),

		password: z
			.string()
			.min(8, 'Mínimo 8 caracteres')
			.label('Contraseña con Toggle')
			.regex(/[A-Z]/, 'Debe contener mayúscula')
			.regex(/[0-9]/, 'Debe contener número')
			.password()
	})

	return ZodsForm.fromSchema(masksSchema, {
		onValidate: ({ isValid }) => {
			console.log('🔍 Máscaras válidas:', isValid)
			if (typeof window !== 'undefined' && (window as any).updateSubmitButton) {
				;(window as any).updateSubmitButton(isValid)
			}
		},
		onSubmit: ({ data }) => {
			console.log('✅ Datos con máscaras:', data)
			alert('¡Datos enviados! Ver consola.')
		}
	})
}
