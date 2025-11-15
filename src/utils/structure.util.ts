import type { Structure, StructureItem } from '../interface'

/**
 * Utilidades para trabajar con la estructura de formularios
 */
export class StructureUtil {
	/**
	 * Obtiene un item de la estructura usando un path con puntos
	 */
	static setField(form: Record<string, any>, fieldPath: string, value: any): boolean {
		const keys = fieldPath.split('.')
		let current: Record<string, any> | undefined = form
		for (const [index, key] of keys.entries()) {
			// Si no lo encuentra, crear un objeto vacío
			if (!current?.[key]) {
				if (current) current[key] = index === keys.length - 1 ? value : {}
			}
			if (current) current = current[key]
		}
		return true
	}

	/**
	 * Obtiene un item de la estructura usando un path con puntos
	 */
	static getItem(structure: Structure, fieldPath: string): StructureItem | null {
		const keys = fieldPath.split('.')
		let current: Structure | StructureItem | undefined = structure

		for (const key of keys) {
			if (!current) return null

			// Si es una estructura, buscar la clave
			if ('children' in (current as StructureItem) && (current as StructureItem).children) {
				current = (current as StructureItem).children![key]
			} else {
				current = (current as Structure)[key]
			}

			if (!current) return null
		}

		return current as StructureItem
	}

	/**
	 * Recorre recursivamente una estructura y ejecuta un callback para cada campo
	 */
	static traverse(
		structure: Structure,
		callback: (key: string, item: StructureItem, fieldPath: string) => void,
		parentPath: string = ''
	): void {
		for (const [key, item] of Object.entries(structure)) {
			const fieldPath = parentPath ? `${parentPath}.${key}` : key

			callback(key, item, fieldPath)

			if (item.children) {
				StructureUtil.traverse(item.children, callback, fieldPath)
			}
		}
	}

	/**
	 * Valida todos los campos de una estructura
	 */
	static validateAll(
		structure: Structure,
		validateCallback: (fieldPath: string, item: StructureItem) => void,
		parentPath: string = ''
	): void {
		for (const [key, item] of Object.entries(structure)) {
			const fieldPath = parentPath ? `${parentPath}.${key}` : key

			if (item.children) {
				StructureUtil.validateAll(item.children, validateCallback, fieldPath)
			} else if (item.validation) {
				validateCallback(fieldPath, item)
			}
		}
	}
}
