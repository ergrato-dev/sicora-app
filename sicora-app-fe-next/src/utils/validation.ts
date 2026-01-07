/**
 * Patrones de validación REGEXP para SICORA
 * Protección contra ataques XSS, injection y validación institucional SENA
 */

// Validaciones SENA - Patterns REGEXP seguros
export const VALIDATION_PATTERNS = {
  // Documento de identidad (solo números, 7-10 dígitos)
  cedula: /^[0-9]{7,10}$/,

  // Email institucional SENA (obligatorio dominio @sena.edu.co)
  emailSena: /^[a-zA-Z0-9._%+-]+@sena\.edu\.co$/,

  // Email general (RFC 5322 compliant, sin scripts)
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  // Nombres (solo letras, espacios, acentos latinos, sin números ni símbolos)
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,

  // Código de ficha SENA (formato específico: 7 dígitos)
  fichaCode: /^[0-9]{7}$/,

  // Teléfono Colombia (formato +57 + 10 dígitos o 10 dígitos)
  telefono: /^(?:\+57\s?)?[0-9]{10}$/,

  // Contraseña segura (min 8 chars, mayús, minús, número, símbolo)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Código de curso/competencia (letras y números, guiones permitidos)
  codigoCurso: /^[A-Z0-9-]{3,20}$/,

  // Texto libre seguro (sin scripts, tags HTML, ni caracteres peligrosos)
  textoSeguro: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:()!?¿¡\-_]{0,500}$/,

  // URL segura (solo HTTPS, dominios permitidos)
  urlSegura: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?$/,

  // Código de centro de formación
  codigoCentro: /^[0-9]{4}$/,

  // GUID/UUID v4 (para IDs seguros)
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Mensajes de error personalizados
export const VALIDATION_MESSAGES = {
  cedula: 'La cédula debe contener entre 7 y 10 dígitos',
  emailSena: 'Debe usar un email institucional @sena.edu.co',
  email: 'Formato de email inválido',
  nombre: 'Solo se permiten letras, espacios y acentos (2-50 caracteres)',
  fichaCode: 'El código de ficha debe tener exactamente 7 dígitos',
  telefono: 'Formato: +57 300 123 4567 o 300 123 4567',
  password: 'Mínimo 8 caracteres: mayúscula, minúscula, número y símbolo',
  codigoCurso: 'Formato inválido. Ej: TI-001, ADSO-2024',
  textoSeguro: 'Texto contiene caracteres no permitidos o excede 500 caracteres',
  urlSegura: 'Solo se permiten URLs HTTPS válidas',
  codigoCentro: 'El código del centro debe tener 4 dígitos',
  uuid: 'Formato UUID inválido',
} as const;

export type ValidationPattern = keyof typeof VALIDATION_PATTERNS;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: string;
}

/**
 * Validador seguro para prevenir ataques
 */
export class SecureValidator {
  /**
   * Valida y sanitiza input usando REGEXP patterns
   */
  static validate(
    value: string,
    pattern: ValidationPattern,
    customMessage?: string
  ): ValidationResult {
    // Sanitización básica: trim y normalización
    const sanitizedValue = value.trim().normalize('NFD');

    // Verificación de longitud para prevenir ataques DoS
    if (sanitizedValue.length > 1000) {
      return {
        isValid: false,
        message: 'Entrada demasiado larga (máximo 1000 caracteres)',
      };
    }

    // Detección de intentos de inyección básicos
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /'.*union.*select/i,
      /drop\s+table/i,
    ];

    const hasDangerousContent = dangerousPatterns.some((dp) => dp.test(sanitizedValue));
    if (hasDangerousContent) {
      return {
        isValid: false,
        message: 'Contenido potencialmente peligroso detectado',
      };
    }

    // Validación con pattern específico
    const regex = VALIDATION_PATTERNS[pattern];
    const isValid = regex.test(sanitizedValue);

    return {
      isValid,
      message: isValid ? undefined : customMessage || VALIDATION_MESSAGES[pattern],
      sanitizedValue: isValid ? sanitizedValue : undefined,
    };
  }

  /**
   * Validación específica para formularios SICORA
   */
  static validateSicoraUser(userData: {
    cedula: string;
    nombre: string;
    email: string;
    telefono?: string;
    fichaCode?: string;
  }): Record<string, ValidationResult> {
    return {
      cedula: this.validate(userData.cedula, 'cedula'),
      nombre: this.validate(userData.nombre, 'nombre'),
      email: this.validate(userData.email, 'emailSena'),
      ...(userData.telefono && {
        telefono: this.validate(userData.telefono, 'telefono'),
      }),
      ...(userData.fichaCode && {
        fichaCode: this.validate(userData.fichaCode, 'fichaCode'),
      }),
    };
  }

  /**
   * Sanitización de contenido HTML
   */
  static sanitizeHTML(dirty: string): string {
    // Implementación básica - en producción usar DOMPurify
    return dirty
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * Escapar contenido para mostrar en UI
   */
  static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
