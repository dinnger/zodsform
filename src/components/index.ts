/**
 * Archivo central de exportación de componentes
 */

export { CheckboxInput } from './CheckboxInput'
export { PasswordInput } from './PasswordInput'
export { SelectInput } from './SelectInput'
export { TextArea } from './TextArea'
export { TextInput } from './TextInput'

import type { ComponentConfig } from '../interface'
import { CheckboxInput } from './CheckboxInput'
import { PasswordInput } from './PasswordInput'
import { SelectInput } from './SelectInput'
import { TextArea } from './TextArea'
/**
 * Mapa de componentes por defecto por tipo
 */
import { TextInput } from './TextInput'

export const DefaultComponents: Record<string, ComponentConfig> = {
	// Tipos de Zod
	string: TextInput,
	number: TextInput,
	boolean: CheckboxInput,

	// Tipos de HTML (legacy)
	text: TextInput,
	email: TextInput,
	password: PasswordInput,
	textarea: TextArea,
	select: SelectInput,
	enum: SelectInput
}
