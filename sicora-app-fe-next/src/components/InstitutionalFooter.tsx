import { BRAND_CONFIG, BRAND_TEXTS, IS_SENA_BUILD } from '../config/brand';
import { cn } from '../utils/cn';
import { SecureContactLink } from './SecureContactLink';

/**
 * InstitutionalFooter - Footer institucional adaptativo
 * Se adapta automáticamente entre configuración SENA y EPTI según variables de entorno
 */

interface InstitutionalFooterProps {
  /** Mostrar enlaces a ministerios */
  showMinistryLinks?: boolean;
  /** Mostrar información de contacto */
  showContactInfo?: boolean;
  /** Mostrar redes sociales */
  showSocialMedia?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function InstitutionalFooter({
  showMinistryLinks = true,
  showContactInfo = true,
  showSocialMedia = true,
  className,
}: InstitutionalFooterProps) {
  const ministryLinks = [
    { name: 'Presidencia', url: 'http://es.presidencia.gov.co/' },
    { name: 'Vicepresidencia', url: 'http://www.vicepresidencia.gov.co/' },
    { name: 'MinEducación', url: 'http://www.mineducacion.gov.co/' },
    { name: 'MinTrabajo', url: 'http://www.mintrabajo.gov.co/' },
    { name: 'MinTIC', url: 'https://www.mintic.gov.co/' },
    { name: 'MinComercio', url: 'http://www.mincit.gov.co/' },
    { name: 'MinHacienda', url: 'http://www.minhacienda.gov.co/' },
    { name: 'MinDefensa', url: 'http://www.mindefensa.gov.co/' },
  ];

  const socialMediaLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/SENA/', icon: '📘' },
    { name: 'Twitter', url: 'https://twitter.com/SENAComunica', icon: '🐦' },
    { name: 'Instagram', url: 'https://www.instagram.com/senacomunica/', icon: '📷' },
    { name: 'YouTube', url: 'https://www.youtube.com/user/SENATV', icon: '📺' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/sena-colombia/', icon: '💼' },
  ];

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      {/* Enlaces a ministerios - solo para SENA */}
      {showMinistryLinks && IS_SENA_BUILD && (
        <div className='bg-gray-800 py-4'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <p className='text-sm text-gray-300 mb-3 font-sena-body'>
                Portal único del Estado Colombiano
              </p>
              <div className='flex flex-wrap justify-center gap-4'>
                {ministryLinks.map((ministry, index) => (
                  <a
                    key={index}
                    href={ministry.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-300 hover:text-blue-200 transition-colors font-sena-body'
                  >
                    {ministry.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información principal - adaptativa según la marca */}
      <div className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Logo y descripción */}
            <div className='lg:col-span-2'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-12 h-12 bg-sena-primary-500 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>
                    {IS_SENA_BUILD ? 'S' : BRAND_CONFIG.organization.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className='text-xl font-sena-heading font-bold text-white'>
                    {IS_SENA_BUILD ? 'SICORA' : BRAND_CONFIG.name}
                  </h3>
                  <p className='text-sm text-gray-300'>
                    {IS_SENA_BUILD
                      ? 'Sistema de Información de Coordinación Académica'
                      : BRAND_CONFIG.subtitle}
                  </p>
                </div>
              </div>
              <p className='text-gray-300 text-sm font-sena-body leading-relaxed'>
                {IS_SENA_BUILD
                  ? 'SICORA es el sistema integral de gestión académica del CGMLTI SENA, que facilita la coordinación de horarios, asistencia, evaluaciones y proyectos de formación tecnológica.'
                  : BRAND_CONFIG.description}
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className='text-white font-sena-heading font-semibold mb-4'>Enlaces Rápidos</h4>
              <ul className='space-y-2'>
                {IS_SENA_BUILD ? (
                  <>
                    <li>
                      <a
                        href='#'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Portal SENA
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        SofiaPlus
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Blackboard
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Territorio SENA
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        href={BRAND_CONFIG.docsUrl}
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Documentación
                      </a>
                    </li>
                    <li>
                      <a
                        href={BRAND_CONFIG.supportUrl}
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Soporte
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Tutorial
                      </a>
                    </li>
                    <li>
                      <SecureContactLink
                        type='email'
                        variant='link'
                        className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                      >
                        Contacto
                      </SecureContactLink>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h4 className='text-white font-sena-heading font-semibold mb-4'>Soporte</h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href={BRAND_CONFIG.supportUrl}
                    className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                  >
                    Mesa de Ayuda
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND_CONFIG.docsUrl}
                    className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                  >
                    Documentación
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                  >
                    Reportar Error
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-gray-300 hover:text-white transition-colors text-sm font-sena-body'
                  >
                    Chat en Línea
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Información de contacto específica para SENA */}
      {showContactInfo && IS_SENA_BUILD && (
        <div className='bg-gray-800 py-6'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Información institucional */}
              <div>
                <h4 className='text-white font-sena-heading font-semibold mb-3'>
                  OneVision Open Source
                </h4>
                <div className='text-gray-300 text-sm font-sena-body space-y-1'>
                  <p>
                    Centro de Gestión de Mercados, Logística y Tecnologías de la Infomación --
                    CGMLTI
                  </p>
                  <p>Calle 52 No. 13 - 65 Bogotá D.C. (Cundinamarca), Colombia</p>
                </div>
              </div>

              {/* Líneas de atención */}
              <div>
                <h4 className='text-white font-sena-heading font-semibold mb-3'>
                  Líneas de Atención
                </h4>
                <div className='text-gray-300 text-sm font-sena-body space-y-1'>
                  <p>Atención al ciudadano: Bogotá (57 1) 3430111</p>
                  <p>Resto del país: 018000 910270</p>
                  <p>Atención al empresario: Bogotá (57 1) 3430101</p>
                  <p>Resto del país: 018000 910682</p>
                  <p>Línea Nacional SENA: +(57) 601 5461500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de contacto para EPTI */}
      {showContactInfo && !IS_SENA_BUILD && (
        <div className='bg-gray-800 py-6'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <h4 className='text-white font-sena-heading font-semibold mb-3'>
                {BRAND_CONFIG.organizationFull}
              </h4>
              <div className='text-gray-300 text-sm font-sena-body space-y-1'>
                <div className='flex justify-center'>
                  <SecureContactLink
                    type='email'
                    variant='link'
                    className='hover:text-white transition-colors'
                  />
                </div>
                <p>Plataforma de gestión académica moderna</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de disclaimer para EPTI */}
      {!IS_SENA_BUILD && (
        <div className='bg-sena-orange bg-opacity-20 border-t border-orange-200 py-4'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='bg-sena-orange bg-opacity-30 border border-orange-300 rounded-lg p-4'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <span className='text-orange-600 text-xl'>⚠️</span>
                </div>
                <div className='flex-1'>
                  <h4 className='text-gray-700 font-sena-heading font-semibold text-sm mb-1'>
                    Aviso Importante - Entorno de Demostración
                  </h4>
                  <p className='text-gray-600 text-xs font-sena-body leading-relaxed'>
                    <strong>Todos los datos son sintéticos y ficticios.</strong> Este sistema es
                    únicamente para demostración y no representa información real de ninguna
                    institución. El código se proporciona &ldquo;tal como está&rdquo; sin garantías. Use bajo su
                    propio riesgo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redes sociales y derechos */}
      <div className='bg-gray-900 py-4 border-t border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
            {/* Derechos de autor */}
            <div className='text-center md:text-left'>
              <p className='text-gray-400 text-sm font-sena-body'>{BRAND_TEXTS.footerText}</p>
              <div className='flex flex-wrap justify-center md:justify-start gap-4 mt-2'>
                <a
                  href='/legal/politica-privacidad'
                  className='text-gray-400 hover:text-white text-xs transition-colors'
                >
                  Política de Privacidad
                </a>
                <a
                  href='/legal/terminos-uso'
                  className='text-gray-400 hover:text-white text-xs transition-colors'
                >
                  Términos de Uso
                </a>
                <a
                  href='/legal/mapa-sitio'
                  className='text-gray-400 hover:text-white text-xs transition-colors'
                >
                  Mapa del Sitio
                </a>
                <a
                  href='/legal/accesibilidad'
                  className='text-gray-400 hover:text-white text-xs transition-colors'
                >
                  Accesibilidad
                </a>
              </div>
            </div>

            {/* Redes sociales - solo para SENA */}
            {showSocialMedia && IS_SENA_BUILD && (
              <div className='flex space-x-4'>
                {socialMediaLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-400 hover:text-white transition-colors'
                    title={social.name}
                  >
                    <span className='text-xl' role='img' aria-label={social.name}>
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
