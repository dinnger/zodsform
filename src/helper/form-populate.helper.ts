/**
 * Helper para poblar formularios con datos
 */
export class FormPopulateHelper {
	/**
	 * Puebla un formulario con datos de forma recursiva
	 */
	static populate(container: HTMLElement, fieldPath: string, value: Record<string, any>): void {
		const input = container.querySelector(`[name="${fieldPath}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		if (!input) return
		FormPopulateHelper.setInputValue(input, value)
	}

	/**
	 * Establece el valor de un input según su tipo
	 */
	private static setInputValue(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: any): void {
		if (input instanceof HTMLInputElement && input.type === 'checkbox') {
			input.checked = Boolean(value)
		} else {
			input.value = String(value)
		}
	}
}
