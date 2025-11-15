import type { ComponentConfig, ZodTypeAny } from './index'
import type { FieldPaths, InferSchemaType, zodOrigin } from './zod.interface'

// ==================== TIPOS ====================
type Structure = {
	[key: string]: StructureItem
}

interface StructureItem {
	type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'boolean' | 'section' | 'box' | 'array'
	label?: string
	placeholder?: string
	description?: string
	required?: boolean
	properties?: {
		visible?: boolean
		disabled?: boolean
		min?: number
		max?: number
		size?: number
		className?: string
		placeholder?: string
		options?: Array<{ value: string | number; label: string }>
		mask?: string | RegExp
	}
	isPassword?: boolean
	customComponent?: ComponentConfig
	children?: Structure
	validation?: ZodTypeAny
}

interface FormConfig<TSchema extends zodOrigin.ZodObject<any> = zodOrigin.ZodObject<any>> {
	structure: Structure
	schema?: TSchema | undefined
	onSubmit?: ((params: { data: any }) => void) | undefined
	onChange?:
		| ((params: {
				fieldPath: TSchema extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<TSchema>> : string
				data: any
				errors: any
				arrayIndex?: number
		  }) => void)
		| undefined
	onValidate?: ((params: { isValid: boolean; data: any; errors: any }) => void) | undefined
	components?: Record<string, ComponentConfig> | undefined
}

export type { Structure, StructureItem, FormConfig }
