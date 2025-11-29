import { DefaultComponents } from './components'
import { DOMHelper, FormPopulateHelper, MaskHelper, ValidationHelper, z } from './helper'
import type { ComponentConfig, FieldPaths, FormConfig, InferSchemaType, Structure, StructureItem, ZodError, zodOrigin } from './interface'
import { NestedObjectUtil, StructureUtil, ZodExtractor } from './utils'

// ==================== zodsForm - MOTOR DE FORMULARIOS ====================
class ZodsForm<TSchema extends zodOrigin.ZodObject<any> = zodOrigin.ZodObject<any>> {
	// Registro global de componentes
	private static componentRegistry: Map<string, ComponentConfig> = new Map()

	private container: HTMLElement
	private structure: Structure
	private baseSchema: TSchema | undefined
	private schema: TSchema | undefined
	private formData: Record<string, any> = {}
	private errors: Record<string, string[]> = {}
	private previousErrorFields: Set<string> = new Set()
	private onSubmitCallback: ((params: { data: any }) => void) | undefined
	private onChangeCallback:
		| ((params: {
				fieldPath: TSchema extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<TSchema>> : string
				data: any
				errors: any
				arrayIndex?: number
		  }) => void)
		| undefined
	private onValidateCallback: ((params: { isValid: boolean; data: any; errors: any }) => void) | undefined
	private targetElement: HTMLElement | null = null
	private customComponents: Map<string, ComponentConfig> = new Map()

	constructor(config: FormConfig<TSchema>, el?: string | HTMLElement) {
		// Identificar el elemento donde se usará el formulario
		if (el) {
			if (typeof el === 'string') {
				this.targetElement = document.querySelector(el)
				if (!this.targetElement) {
					throw new Error(`ZodsForm: No se encontró el elemento con el selector "${el}"`)
				}
			} else {
				this.targetElement = el
			}
		}

		this.container = document.createElement('form')
		this.container.classList.add('zodsForm-form')
		this.structure = config.structure
		this.baseSchema = config.schema as TSchema | undefined
		this.schema = config.schema as TSchema | undefined
		this.onSubmitCallback = config.onSubmit
		this.onChangeCallback = config.onChange
		this.onValidateCallback = config.onValidate

		// Cargar componentes personalizados si se proporcionan
		if (config.components) {
			Object.entries(config.components).forEach(([key, component]) => {
				this.customComponents.set(key, component)
			})
		}

		this.container.addEventListener('submit', (e) => {
			e.preventDefault()
			this.handleSubmit()
		})
	}

	/**
	 * Registra un componente globalmente para todas las instancias de ZodsForm
	 */
	static registerComponent(name: string, component: ComponentConfig): void {
		ZodsForm.componentRegistry.set(name, component)
	}

	/**
	 * Registra múltiples componentes globalmente
	 */
	static registerComponents(components: Record<string, ComponentConfig>): void {
		Object.entries(components).forEach(([name, component]) => {
			ZodsForm.componentRegistry.set(name, component)
		})
	}

	/**
	 * Obtiene un componente (primero busca por nombre del campo, luego por tipo en personalizados, globales y defaults)
	 */
	private getComponent(type: string, fieldPath?: string): ComponentConfig | undefined {
		// Prioridad 1: Componente específico por nombre de campo
		if (fieldPath && this.customComponents.has(fieldPath)) {
			return this.customComponents.get(fieldPath)
		}

		// Prioridad 2: Componente por nombre de campo en registro global
		if (fieldPath && ZodsForm.componentRegistry.has(fieldPath)) {
			return ZodsForm.componentRegistry.get(fieldPath)
		}

		// Prioridad 3: Componente por tipo en instancia
		if (this.customComponents.has(type)) {
			return this.customComponents.get(type)
		}

		// Prioridad 4: Componente por tipo en registro global
		if (ZodsForm.componentRegistry.has(type)) {
			return ZodsForm.componentRegistry.get(type)
		}

		// Prioridad 5: Componente default
		return DefaultComponents[type]
	}

	/**
	 * Renderiza el formulario
	 */
	render(): HTMLElement {
		this.container.innerHTML = ''
		this.container.classList.add('zodsForm-form')
		const fieldsContainer = this.renderStructure(this.structure)
		this.container.appendChild(fieldsContainer)

		// Si se especificó un elemento objetivo, montar automáticamente
		if (this.targetElement) {
			this.targetElement.appendChild(this.container)
		}

		return this.container
	}

	/**
	 * Renderiza la estructura del formulario recursivamente
	 */
	private renderStructure(structure: Structure, parentPath: string = '', arrayIndex?: number): HTMLElement {
		const container = document.createElement('div')
		container.classList.add('zodsForm-grid', 'grid', 'grid-cols-12', 'gap-3', 'mb-5')

		for (const [key, item] of Object.entries(structure)) {
			const fieldPath = (parentPath ? `${parentPath}.${key}` : key) as FieldPaths<InferSchemaType<TSchema>>
			const element = this.renderField(key, item, fieldPath, arrayIndex)
			const size = ['box', 'array'].includes(item.type) ? 12 : 3
			element.style.gridColumn = `span ${size}`

			container.appendChild(element)

			// Aplicar propiedades
			if (item.properties) {
				Object.entries(item.properties).forEach(([key, value]) => {
					this.setFieldProperty({ fieldPath, property: key as keyof NonNullable<StructureItem['properties']>, value, container })
				})
			}
		}

		if (this.baseSchema) this.schema = ValidationHelper.validateVisibleFieldsOnly(this.baseSchema, this.structure, this.formData)

		return container
	}

	/**
	 * Renderiza un campo individual
	 */
	private renderField(
		_key: string,
		item: StructureItem,
		fieldPath: FieldPaths<InferSchemaType<TSchema>>,
		arrayIndex?: number
	): HTMLElement {
		const wrapper = document.createElement('div')
		wrapper.classList.add('zodsForm-field', 'flex', 'flex-col', 'gap-2')
		wrapper.setAttribute('data-type', item.type)
		wrapper.setAttribute('data-field', fieldPath)

		// Contenedores especiales
		if (item.type === 'section' || item.type === 'box') {
			if (item.label) {
				const title = document.createElement('h3')
				title.classList.add('zodsForm-section-title')
				title.textContent = item.label
				wrapper.appendChild(title)
			}
			if (item.children) {
				const childrenContainer = this.renderStructure(item.children, fieldPath, arrayIndex)
				wrapper.appendChild(childrenContainer)
			}

			return wrapper
		}

		// Array - renderizar como estructura dinámica con botones agregar/eliminar
		if (item.type === 'array') {
			// Contenedor del título y botón agregar
			const headerContainer = document.createElement('div')
			headerContainer.classList.add('flex', 'items-center', 'justify-between', 'mb-3')

			if (item.label) {
				const title = document.createElement('h3')
				title.classList.add('zodsForm-section-title', 'm-0')
				title.textContent = item.label
				headerContainer.appendChild(title)
			}

			// Botón para agregar elementos
			const addButton = document.createElement('button')
			addButton.type = 'button'
			addButton.textContent = '+ Agregar'
			addButton.classList.add(
				'zodsForm-array-add-btn',
				'px-3',
				'py-1',
				'bg-blue-500',
				'text-white',
				'rounded',
				'hover:bg-blue-600',
				'text-sm'
			)
			addButton.addEventListener('click', () => this.addArrayElement(fieldPath, item))
			headerContainer.appendChild(addButton)

			wrapper.appendChild(headerContainer)

			// Contenedor de elementos del array
			const arrayContainer = document.createElement('div')
			arrayContainer.classList.add('zodsForm-array-container')
			arrayContainer.setAttribute('data-array-path', fieldPath)

			// Renderizar el primer elemento por defecto
			const firstElement = this.renderArrayElement(item, fieldPath, 0)
			arrayContainer.appendChild(firstElement)

			wrapper.appendChild(arrayContainer)

			return wrapper
		}

		// Label
		if (item.label) {
			const label = document.createElement('label')
			label.htmlFor = fieldPath
			label.textContent = item.label
			if (item.required) {
				const requiredSpan = document.createElement('span')
				requiredSpan.classList.add('required')
				requiredSpan.textContent = '*'
				label.appendChild(requiredSpan)
			}
			wrapper.appendChild(label)
		}

		// Input
		const input = this.createInput(item, fieldPath, arrayIndex)
		wrapper.appendChild(input)

		// Descripción
		if (item.description) {
			const desc = document.createElement('small')
			desc.classList.add('zodsForm-description')
			desc.textContent = item.description
			wrapper.appendChild(desc)
		}

		// Error container
		const errorContainer = document.createElement('div')
		errorContainer.classList.add('zodsForm-error')
		errorContainer.setAttribute('data-error-for', fieldPath)
		wrapper.appendChild(errorContainer)

		return wrapper
	}

	/**
	 * Renderiza un elemento individual del array con su botón de eliminar
	 */
	private renderArrayElement(item: StructureItem, arrayPath: string, index: number): HTMLElement {
		// Asegurar que el array existe en formData
		let arrayData = NestedObjectUtil.get(this.formData, arrayPath)
		if (!Array.isArray(arrayData)) {
			arrayData = [{}]
			NestedObjectUtil.set(this.formData, arrayPath, arrayData)
		}

		// Asegurar que existe el elemento en el índice
		while (arrayData.length <= index) {
			arrayData.push({})
		}

		const elementWrapper = document.createElement('div')
		elementWrapper.classList.add('zodsForm-array-element', 'border', 'border-gray-300', 'rounded', 'p-4', 'mb-3', 'relative')
		elementWrapper.setAttribute('data-array-index', String(index))

		// Botón eliminar en la esquina superior derecha
		const deleteButton = document.createElement('button')
		deleteButton.type = 'button'
		deleteButton.textContent = '✕'
		deleteButton.classList.add(
			'zodsForm-array-delete-btn',
			'absolute',
			'top-2',
			'right-2',
			'text-red-500',
			'hover:text-red-700',
			'font-bold',
			'text-xl',
			'leading-none'
		)
		deleteButton.addEventListener('click', () => this.removeArrayElement(arrayPath, index))
		elementWrapper.appendChild(deleteButton)

		// Renderizar los campos del elemento pasando el índice del array
		if (item.children) {
			const childrenContainer = this.renderStructure(item.children, arrayPath, index)
			elementWrapper.appendChild(childrenContainer)
		}

		return elementWrapper
	}

	/**
	 * Agrega un nuevo elemento al array
	 */
	private addArrayElement(arrayPath: string, item: StructureItem): void {
		const arrayContainer = this.container.querySelector(`[data-array-path="${arrayPath}"]`)
		if (!arrayContainer) return

		// Obtener el array actual de datos
		const arrayData = this.getNestedValue(this.formData, arrayPath) as any[]
		const currentLength = Array.isArray(arrayData) ? arrayData.length : 0

		// Agregar un objeto vacío al array de datos
		if (!Array.isArray(arrayData)) {
			this.setNestedValue(this.formData, arrayPath, [{}])
		} else {
			arrayData.push({})
		}

		// Renderizar el nuevo elemento
		const newIndex = currentLength
		const newElement = this.renderArrayElement(item, arrayPath, newIndex)
		arrayContainer.appendChild(newElement)

		// Re-indexar todos los elementos
		this.reindexArrayElements(arrayPath)
	}

	/**
	 * Elimina un elemento del array o limpia sus datos si es el último
	 */
	private removeArrayElement(arrayPath: string, index: number): void {
		const arrayContainer = this.container.querySelector(`[data-array-path="${arrayPath}"]`)
		if (!arrayContainer) return

		const elements = arrayContainer.querySelectorAll('.zodsForm-array-element')

		// Si solo hay un elemento, limpiar sus datos en lugar de eliminarlo
		if (elements.length === 1) {
			const arrayData = this.getNestedValue(this.formData, arrayPath) as any[]
			if (Array.isArray(arrayData) && arrayData[0]) {
				// Limpiar todos los campos del primer elemento
				const firstElement = arrayData[0]
				Object.keys(firstElement).forEach((key) => {
					firstElement[key] = undefined
				})

				// Limpiar los inputs del DOM
				const elementWrapper = elements[0] as HTMLElement
				const inputs = elementWrapper.querySelectorAll('input, textarea, select')
				inputs.forEach((input: any) => {
					if (input.type === 'checkbox') {
						input.checked = false
					} else {
						input.value = ''
					}
					input.dispatchEvent(new Event('input', { bubbles: true }))
				})
			}
			return
		}

		// Si hay más de un elemento, eliminar el elemento
		const arrayData = this.getNestedValue(this.formData, arrayPath) as any[]
		if (Array.isArray(arrayData)) {
			arrayData.splice(index, 1)
		}

		// Eliminar el elemento del DOM
		const elementToRemove = elements[index]
		if (elementToRemove) {
			elementToRemove.remove()
		}

		// Re-indexar todos los elementos
		this.reindexArrayElements(arrayPath)

		// Validar el formulario después de eliminar
		this.notifyValidationState()
	}

	/**
	 * Re-indexa los elementos del array después de agregar/eliminar
	 */
	private reindexArrayElements(arrayPath: string): void {
		const arrayContainer = this.container.querySelector(`[data-array-path="${arrayPath}"]`)
		if (!arrayContainer) return

		const elements = arrayContainer.querySelectorAll('.zodsForm-array-element')
		elements.forEach((element, newIndex) => {
			element.setAttribute('data-array-index', String(newIndex))
		})
	}

	/**
	 * Crea el input apropiado según el tipo usando el sistema de componentes
	 */
	private createInput(item: StructureItem, fieldPath: FieldPaths<InferSchemaType<TSchema>>, arrayIndex?: number): HTMLElement {
		// Obtener componente (personalizado Zod, de instancia, global o default)
		const component = item.customComponent || this.getComponent(item.type, fieldPath)

		if (!component) {
			throw new Error(`No se encontró componente para el tipo "${item.type}"`)
		}

		const input = component.render({
			fieldPath,
			type: item.type,
			label: item.label,
			properties: item.properties,
			value: this.getNestedValue(this.formData, fieldPath, arrayIndex),
			required: item.required,
			isPassword: item.isPassword
		})

		// Agregar event listeners
		const actualInput = input.querySelector('input, textarea, select') || input

		// Para checkboxes usar 'change', para otros usar 'input'
		const eventType = actualInput instanceof HTMLInputElement && actualInput.type === 'checkbox' ? 'change' : 'input'

		actualInput.addEventListener(eventType, () => {
			this.handleFieldChange(fieldPath, actualInput as any, item)
			// Para checkboxes, validar inmediatamente después del cambio
			// if (actualInput instanceof HTMLInputElement && actualInput.type === 'checkbox') {
			this.validateField(fieldPath, item, actualInput as HTMLElement)
			// }
		})

		actualInput.addEventListener('blur', () => {
			this.validateField(fieldPath, item, actualInput as HTMLElement)
		})

		return input
	}

	/**
	 * Maneja cambios en un campo
	 */
	private handleFieldChange(fieldPath: string, input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, item: StructureItem) {
		const value = ValidationHelper.extractInputValue(input, item.type)

		// Detectar si el input está dentro de un array element
		const arrayIndex = this.getArrayIndexForElement(input)
		this.setNestedValue(this.formData, fieldPath, value, arrayIndex)

		if (this.onChangeCallback) {
			const changeParams: {
				fieldPath: TSchema extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<TSchema>> : string
				data: any
				errors: any
				arrayIndex?: number
			} = {
				fieldPath: fieldPath as TSchema extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<TSchema>> : string,
				data: this.formData,
				errors: this.errors
			}

			// Solo agregar arrayIndex si tiene un valor definido
			if (arrayIndex !== undefined) {
				changeParams.arrayIndex = arrayIndex
			}

			this.onChangeCallback(changeParams)
		}

		// Notificar el estado de validación después del cambio
		this.notifyValidationState()
	}

	/**
	 * Obtiene el índice del array para un elemento del DOM
	 */
	private getArrayIndexForElement(element: HTMLElement): number | undefined {
		const arrayElement = element.closest('.zodsForm-array-element')
		if (arrayElement) {
			const indexAttr = arrayElement.getAttribute('data-array-index')
			return indexAttr !== null ? Number.parseInt(indexAttr, 10) : undefined
		}
		return undefined
	}

	/**
	 * Valida un campo específico
	 */
	private validateField(fieldPath: string, item: StructureItem, targetInput?: HTMLElement) {
		if (!item.validation) return

		// Obtener el valor actual del input (usar el targetInput si se proporciona)
		const input = (targetInput || this.container.querySelector(`[name="${fieldPath}"]`)) as
			| HTMLInputElement
			| HTMLTextAreaElement
			| HTMLSelectElement

		// Detectar el índice del array si el input está dentro de uno
		const arrayIndex = input ? this.getArrayIndexForElement(input) : undefined
		let value = this.getNestedValue(this.formData, fieldPath, arrayIndex)

		// Si hay un input, extraer su valor actual
		if (input) {
			value = ValidationHelper.extractInputValue(input, item.type)
			this.setNestedValue(this.formData, fieldPath, value, arrayIndex)
		}

		// Obtener el contenedor correcto (elemento de array o formulario completo)
		const arrayElement = input?.closest('.zodsForm-array-element') as HTMLElement | null
		const targetContainer = arrayElement || this.container

		// Si el campo es opcional y está vacío, considerarlo válido
		if (ValidationHelper.isEmptyAndOptional(value, item.required ?? false)) {
			delete this.errors[fieldPath]
			DOMHelper.clearFieldError(targetContainer, fieldPath)
			return
		}

		// Validar el valor del campo
		const result = ValidationHelper.validateFieldValue(item, value)

		// Guardar el campo como que ha tenido errores anteriormente
		this.previousErrorFields.add(fieldPath)

		if (!result.success && result.errors) {
			this.errors[fieldPath] = result.errors
			DOMHelper.showFieldError(targetContainer, fieldPath, result.errors)
		} else {
			// Campo válido individualmente
			delete this.errors[fieldPath]
			DOMHelper.clearFieldError(targetContainer, fieldPath)

			// Verificar errores de schema completo (ej: refine cross-field)
			this.validateCrossFieldErrors()
		}

		// Notificar el estado de validación después de validar el campo
		this.notifyValidationState()
	}

	/**
	 * Valida errores que dependen de múltiples campos (refine)
	 */
	private validateCrossFieldErrors() {
		if (!this.schema) return

		const schemaResult = ValidationHelper.validateSchema(this.schema, this.formData)
		if (!schemaResult.success) {
			const zodErrors = schemaResult.error.issues

			// Buscar errores para campos que han tenido errores previamente
			const fieldErrors = zodErrors.filter((err: any) => {
				// Convertir path del error (puede contener índices de array) a path del campo
				const errorPath = this.normalizeErrorPath(err.path)
				const listPreviousErrorFields = Array.from(this.previousErrorFields)
				return listPreviousErrorFields.includes(errorPath)
			})

			if (fieldErrors.length > 0) {
				// Aplicar errores considerando los índices de array
				fieldErrors.forEach((err: any) => {
					const pathArray = err.path as (string | number)[]
					const normalizedPath = this.normalizeErrorPath(pathArray)

					// Extraer el índice de array si existe en el path
					let arrayIndex: number | undefined = undefined
					let targetContainer = this.container

					// Buscar índices numéricos en el path (ej: ['security', 0, 'confirmPassword'])
					for (let i = 0; i < pathArray.length; i++) {
						if (typeof pathArray[i] === 'number') {
							arrayIndex = pathArray[i] as number
							// Construir el path del array (ej: 'security')
							const arrayPath = pathArray
								.slice(0, i)
								.filter((s) => typeof s === 'string')
								.join('.')
							// Buscar el elemento de array específico
							const arrayElements = this.container.querySelectorAll(`[data-array-path="${arrayPath}"] .zodsForm-array-element`)
							if (arrayElements[arrayIndex]) {
								targetContainer = arrayElements[arrayIndex] as HTMLElement
							}
							break
						}
					}

					// Mostrar el error en el contenedor correcto
					DOMHelper.showFieldError(targetContainer, normalizedPath, [err.message])
					this.errors[normalizedPath] = [err.message]
				})
			}
		}
	}

	/**
	 * Normaliza un path de error de Zod eliminando índices de array
	 * Por ejemplo: ['security', 0, 'confirmPassword'] -> 'security.confirmPassword'
	 */
	private normalizeErrorPath(pathArray: (string | number)[]): string {
		return pathArray.filter((segment) => typeof segment === 'string').join('.')
	}

	/**
	 * Notifica el estado de validación del formulario completo
	 * Usado para habilitar/deshabilitar el botón de submit en tiempo real
	 */
	private notifyValidationState() {
		if (!this.onValidateCallback) return

		// Determinar si hay errores actuales
		const hasErrors = Object.keys(this.errors).length > 0
		let isValid = !hasErrors

		// Validar con el schema completo si existe (solo campos visibles)
		if (this.schema && !hasErrors) {
			const result = ValidationHelper.validateSchema(this.schema, this.formData)
			if (!result.success) {
				isValid = false
			}
		}

		// Invocar callback con el estado actual
		this.onValidateCallback({ isValid, data: this.formData, errors: this.errors })
	}

	/**
	 * Maneja el submit del formulario
	 */
	private handleSubmit() {
		// Validar todos los campos
		this.validateAllFields(this.structure)

		// Determinar si hay errores
		const hasErrors = Object.keys(this.errors).length > 0
		let isValid = !hasErrors

		// Validar con el schema completo si existe (solo campos visibles)
		if (this.schema && !hasErrors) {
			const result = ValidationHelper.validateSchema(this.schema, this.formData)

			if (!result.success) {
				console.error('Errores de validación del schema:', result.error)
				this.displaySchemaErrors(result.error)
				isValid = false
			}
		}

		// Invocar callback onValidate si existe
		if (this.onValidateCallback) {
			this.onValidateCallback({ isValid, data: this.formData, errors: this.errors })
		}

		// Si no es válido, no continuar con onSubmit
		if (!isValid) {
			console.error('Errores de validación:', this.errors)
			return
		}

		// Enviar datos
		if (this.onSubmitCallback) {
			this.onSubmitCallback({ data: this.formData })
		}
	}

	/**
	 * Valida todos los campos recursivamente
	 */
	private validateAllFields(structure: Structure, parentPath: string = '') {
		StructureUtil.validateAll(
			structure,
			(fieldPath, item) => {
				this.validateField(fieldPath, item)
			},
			parentPath
		)
	}

	/**
	 * Muestra errores del schema completo
	 */
	private displaySchemaErrors(error: ZodError) {
		;(error as any).errors.forEach((err: any) => {
			const fieldPath = this.normalizeErrorPath(err.path)
			const errorContainer = this.container.querySelector(`[data-error-for="${fieldPath}"]`)

			if (errorContainer) {
				errorContainer.textContent = err.message
				errorContainer.classList.add('visible')
			}

			const field = this.container.querySelector(`[data-field="${fieldPath}"]`)
			field?.classList.add('has-error')
		})
	}

	/**
	 * Obtiene un valor anidado usando un path con puntos
	 * Si el path contiene un array, accede al elemento especificado o al primero
	 */
	private getNestedValue(obj: any, path: string, arrayIndex?: number): any {
		// Detectar si algún segmento del path es un array
		const pathParts = path.split('.')
		let arrayPath = ''

		// Buscar en la estructura si algún padre es un array
		for (let i = 0; i < pathParts.length - 1; i++) {
			const partialPath = pathParts.slice(0, i + 1).join('.')
			const structureItem = this.getStructureItem(partialPath)

			if (structureItem && structureItem.type === 'array') {
				arrayPath = partialPath
				break
			}
		}

		if (arrayPath) {
			// Obtener el valor del array
			const arrayValue = NestedObjectUtil.get(obj, arrayPath)
			if (!Array.isArray(arrayValue) || arrayValue.length === 0) {
				return undefined
			}

			// Usar el índice proporcionado o 0 por defecto
			const targetIndex = arrayIndex !== undefined ? arrayIndex : 0
			if (targetIndex >= arrayValue.length) {
				return undefined
			}

			// Obtener el valor del elemento del array correspondiente
			const remainingPath = path.substring(arrayPath.length + 1)
			return NestedObjectUtil.get(arrayValue[targetIndex], remainingPath)
		}

		return NestedObjectUtil.get(obj, path)
	}

	/**
	 * Establece un valor anidado usando un path con puntos
	 * Si el path contiene un array, crea la estructura correcta
	 */
	private setNestedValue(obj: any, path: string, value: any, arrayIndex?: number) {
		// Detectar si algún segmento del path es un array
		const pathParts = path.split('.')
		let isInArray = false
		let arrayPath = ''

		// Buscar en la estructura si algún padre es un array
		for (let i = 0; i < pathParts.length - 1; i++) {
			const partialPath = pathParts.slice(0, i + 1).join('.')
			const structureItem = this.getStructureItem(partialPath)

			if (structureItem && structureItem.type === 'array') {
				isInArray = true
				arrayPath = partialPath
				break
			}
		}

		if (isInArray && arrayPath) {
			// Asegurar que el array existe
			let arrayValue = NestedObjectUtil.get(obj, arrayPath)
			if (!Array.isArray(arrayValue)) {
				arrayValue = [{}]
				NestedObjectUtil.set(obj, arrayPath, arrayValue)
			}

			// Usar el índice proporcionado o 0 por defecto
			const targetIndex = arrayIndex !== undefined ? arrayIndex : 0

			// Asegurar que existe el elemento en ese índice
			while (arrayValue.length <= targetIndex) {
				arrayValue.push({})
			}

			// Establecer el valor en el elemento del array correspondiente
			const remainingPath = path.substring(arrayPath.length + 1)
			NestedObjectUtil.set(arrayValue[targetIndex], remainingPath, value)
		} else {
			NestedObjectUtil.set(obj, path, value)
		}
	}

	/**
	 * Obtiene los datos del formulario
	 */
	getData(): any {
		return { ...this.formData }
	}

	/**
	 * Obtiene los errores del formulario
	 */
	getErrors(): any {
		return { ...this.errors }
	}

	/**
	 * Establece valores en el formulario
	 */
	setData({
		fieldPath,
		value
	}: {
		fieldPath: TSchema extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<TSchema>> : string
		value: any
	}) {
		// 1. Actualizar la estructura interna
		const structureItem = this.getStructureItem(fieldPath)
		if (!structureItem) {
			console.warn(`ZodsForm: No se encontró el campo "${fieldPath}" en la estructura`)
			return
		}
		// 2. Obtener la estructura interna
		this.setDataStructure(fieldPath, value)
		this.populateForm(fieldPath, value)

		// 3. Validar el campo después de actualizar el valor programáticamente
		this.validateField(fieldPath, structureItem)

		this.formData[fieldPath] = value

		// 4. Se agrega un pequeño delay para asegurar que el DOM esté actualizado
		setTimeout(() => {
			const fieldElement = this.container.querySelector(`[data-field="${fieldPath}"]`) as HTMLElement
			if (!fieldElement) {
				console.warn(`ZodsForm: No se encontró el elemento DOM para "${fieldPath}"`)
				return
			}
			const actualInput = fieldElement.querySelector('input, textarea, select') as
				| HTMLInputElement
				| HTMLTextAreaElement
				| HTMLSelectElement
			this.handleFieldChange(fieldPath, actualInput, structureItem)
		}, 1)
	}

	/**
	 * Establece propiedades de un campo
	 */
	setFieldProperty({
		fieldPath,
		property,
		value,
		container
	}: {
		fieldPath: FieldPaths<InferSchemaType<TSchema>>
		property: keyof NonNullable<StructureItem['properties']>
		value: any
		container?: HTMLElement
	}) {
		// 1. Actualizar la estructura interna
		const structureItem = this.getStructureItem(fieldPath)
		if (!structureItem) {
			console.warn(`ZodsForm: No se encontró el campo "${fieldPath}" en la estructura`)
			return
		}

		// Inicializar properties si no existe
		if (!structureItem.properties) {
			structureItem.properties = {}
		}
		// Actualizar el valor en la estructura
		if ((structureItem.properties as any)[property] === value && !container) return // Si hay un schema base, validar con él

		;(structureItem.properties as any)[property] = value

		// 2. Aplicar cambios visuales en el DOM
		const targetContainer = container || this.container
		const fieldElement = targetContainer.querySelector(`[data-field="${fieldPath}"]`) as HTMLElement
		if (!fieldElement) {
			console.warn(`ZodsForm: No se encontró el elemento DOM para "${fieldPath}"`)
			return
		}

		// Validar si el campo es visible
		if (!ValidationHelper.isVisible(structureItem.properties)) delete this.errors[fieldPath]

		// Delegar actualización visual al helper
		DOMHelper.updateFieldProperty(fieldElement, property as string, value, (input, mask) => MaskHelper.applyMask(input, mask))

		// Si hay un schema base, validar con él
		if (this.baseSchema && !container) {
			this.schema = ValidationHelper.validateVisibleFieldsOnly(this.baseSchema, this.structure, this.formData)
		}
	}

	/**
	 * Obtiene un item de la estructura usando un path con puntos
	 */
	private getStructureItem(fieldPath: string): StructureItem | null {
		return StructureUtil.getItem(this.structure, fieldPath)
	}

	/**
	 * Obtiene un item de la estructura usando un path con puntos
	 */
	private setDataStructure(fieldPath: string, value: any): boolean {
		return StructureUtil.setField(this.formData, fieldPath, value)
	}

	/**
	 * Puebla el formulario con datos
	 */
	private populateForm(fieldPath: string, value: any) {
		FormPopulateHelper.populate(this.container, fieldPath, value)
	}

	/**
	 * Método estático para crear formulario desde schema Zod
	 */
	static fromSchema<T extends zodOrigin.ZodObject<any>>(
		schema: T,
		config?: {
			el?: string | HTMLElement
			onSubmit?: (params: { data: any }) => void
			onChange?: (params: {
				fieldPath: T extends zodOrigin.ZodObject<any> ? FieldPaths<InferSchemaType<T>> : string
				data: any
				errors: any
				arrayIndex?: number
			}) => void
			onValidate?: (params: { isValid: boolean; data: any; errors: any }) => void
			components?: Record<string, ComponentConfig>
		}
	): ZodsForm<T> {
		const structure = ZodExtractor.schemaToStructure(schema)
		return new ZodsForm<T>(
			{
				structure,
				schema,
				onSubmit: config?.onSubmit,
				onChange: config?.onChange,
				onValidate: config?.onValidate,
				components: config?.components
			},
			config?.el
		)
	}
}

// También puedes exportar para usar como librería
export { ZodsForm, ZodExtractor, z }
export type { Structure, StructureItem, FormConfig }

export type { ComponentConfig, RenderConfig } from './interface'
