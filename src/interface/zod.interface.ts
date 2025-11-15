import type { ZodError, ZodTypeAny, z as zodOrigin } from 'zod'

// ==================== TIPOS DE UTILIDAD ====================
/**
 * Extrae todas las rutas de campos anidados de un objeto, incluyendo propiedades dentro de arrays
 * Ejemplo: { user: { name: string, addresses: Array<{ street: string }> } }
 * Resultado: "user" | "user.name" | "user.addresses" | "user.addresses.street"
 */
type FieldPaths<T, Prefix extends string = ''> = T extends object
	? {
			[K in keyof T & string]:
				| (Prefix extends '' ? K : `${Prefix}.${K}`)
				| (T[K] extends Array<infer U>
						? U extends object
							? FieldPaths<U, Prefix extends '' ? K : `${Prefix}.${K}`>
							: never
						: T[K] extends object
							? FieldPaths<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
							: never)
		}[keyof T & string]
	: never

/**
 * Extrae el tipo inferido de un schema Zod
 */
type InferSchemaType<T> = T extends zodOrigin.ZodObject<infer Shape> ? zodOrigin.infer<zodOrigin.ZodObject<Shape>> : never

export type { zodOrigin, ZodTypeAny, ZodError, FieldPaths, InferSchemaType }
