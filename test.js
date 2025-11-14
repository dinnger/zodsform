import { z } from 'zod'

// --- Solución: Extrayendo el .refine() desde _def ---

// 1. Creamos el esquema ORIGINAL completo (con 'age' desde el inicio)
// y le aplicamos el refinamiento directamente.
const UsuarioSchema = z
	.object({
		firstName: z.string('El nombre es obligatorio').min(2, 'Mínimo 2 caracteres').optional(),
		lastName: z.string().min(2, 'Mínimo 2 caracteres').optional(),
		email: z.string().email('Email inválido'),
		security: z.object({
			password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
			confirmPassword: z.string()
		}),
		country: z.enum(['mx', 'us', 'es', 'ar']),
		zipCode: z.string().length(5, 'Código postal debe ser 5 dígitos'),
		acceptTerms: z.boolean().refine((data) => data === true, {
			message: 'Debes aceptar los términos y condiciones',
			path: ['acceptTerms']
		}),
		age: z.number().min(18, 'Debes ser mayor de edad').max(120)
	})
	.refine((data) => data.security.password === data.security.confirmPassword, {
		// El refine se define aquí
		message: 'Las contraseñas no coinciden',
		path: ['security.confirmPassword']
	})

// 2. Extraemos el refinamiento DIRECTAMENTE del esquema original.
// ADVERTENCIA: Esto usa propiedades internas de Zod (_def) y puede ser frágil.
// Asumimos que es el primer y único refinamiento a nivel de objeto (el de acceptTerms está en el campo, no en el objeto).
// CORRECCIÓN: La propiedad correcta es .checks
const passwordRefinement = UsuarioSchema._def.checks[0]

// 3. Creamos el esquema derivado
let UsuarioSinAgeSchema = UsuarioSchema.safeExtend({})

UsuarioSinAgeSchema = UsuarioSinAgeSchema.omit({ age: true }) // Al hacer .omit(), Zod descarta el .refine() original...

UsuarioSinAgeSchema.refine(passwordRefinement.def.fn, { message: passwordRefinement.def.error(), path: passwordRefinement.def.path })

// console.log(passwordRefinement)

console.log(passwordRefinement.def.fn.toString())
console.log('-----------')
console.log(passwordRefinement.def.error())
console.log('-----------')
console.log(passwordRefinement.def.path)
// ...así que lo RE-APLICAMOS extrayéndolo del original:
// CORRECCIÓN: La propiedad correcta es .validation

// --- Ejemplo de uso ---
// Estos datos tienen contraseñas que NO coinciden a propósito
const datosValidosSinAge = {
	security: {
		password: 'testabcdfada',
		confirmPassword: 'testabcdfad' // Diferente
	},
	firstName: 'Walter',
	email: 'testabcdfad@gmail.com',
	country: 'mx',
	zipCode: '23232',
	acceptTerms: true
}

const datosValidosConAge = {
	security: {
		password: 'testabcdfada',
		confirmPassword: 'testabcdfad' // Diferente
	},
	firstName: 'Walter',
	email: 'testabcdfad@gmail.com',
	country: 'mx',
	zipCode: '23232',
	acceptTerms: true,
	age: 23
}

console.log('\n--- Probando el Esquema Derivado (UsuarioSinAgeSchema) ---')
try {
	const usuarioParseado = UsuarioSinAgeSchema.parse(datosValidosSinAge)
	console.log('Válido (sin age):', usuarioParseado)
} catch (e) {
	// AHORA SÍ FALLARÁ por las contraseñas
	console.error('Error en UsuarioSinAgeSchema (esperado, contraseñas no coinciden):', e.message)
}

console.log('\n--- Probando el Esquema Original (UsuarioSchema) ---')
try {
	console.log('Intentando parsear datos CON age (y contraseñas incorrectas)...')
	const usuarioParseado = UsuarioSchema.parse(datosValidosConAge)
	console.log('Válido (con age):', usuarioParseado)
} catch (e) {
	// También fallará por las contraseñas
	console.error('Error en UsuarioSchema (esperado, contraseñas no coinciden):', e.message)
}
