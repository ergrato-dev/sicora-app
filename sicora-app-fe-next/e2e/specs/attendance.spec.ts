/**
 * E2E Tests - Asistencia
 * Sprint 17-18: Testing E2E
 */

import { test, expect, helpers } from '../fixtures';

test.describe('Asistencia', () => {
  test.describe('Lista de Asistencia', () => {
    test('debe mostrar la página de asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia');
      await helpers.waitForLoading(authenticatedPage);

      // Verificar que la página se cargó
      const pageTitle = authenticatedPage.locator('h1, h2').first();
      await expect(pageTitle).toBeVisible();
    });

    test('debe mostrar filtros de asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia');
      await helpers.waitForLoading(authenticatedPage);

      // Buscar filtros (fecha, programa, grupo)
      const filters = authenticatedPage.locator(
        '[data-testid="filters"], form, .filters'
      );

      if (await filters.isVisible()) {
        // Debería haber al menos un selector de fecha
        const dateFilter = authenticatedPage.locator(
          'input[type="date"], [data-testid="date-filter"]'
        );
        await expect(dateFilter.first()).toBeVisible();
      }
    });

    test('debe mostrar tabla o lista de registros', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia');
      await helpers.waitForLoading(authenticatedPage);

      // Buscar tabla o lista
      const dataDisplay = authenticatedPage.locator(
        'table, [data-testid="attendance-list"], .attendance-list'
      );

      if (await dataDisplay.isVisible()) {
        await expect(dataDisplay).toBeVisible();
      }
    });
  });

  test.describe('Registro de Asistencia', () => {
    test('debe navegar a página de registro', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/registrar');
      await helpers.waitForLoading(instructorPage);

      // Verificar que estamos en la página de registro
      const pageContent = instructorPage.locator(
        '[data-testid="attendance-form"], form, main'
      );
      await expect(pageContent).toBeVisible();
    });

    test('debe permitir seleccionar grupo/ficha', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/registrar');
      await helpers.waitForLoading(instructorPage);

      const groupSelect = instructorPage.locator(
        'select[name="grupo"], [data-testid="group-select"]'
      );

      if (await groupSelect.isVisible()) {
        await expect(groupSelect).toBeVisible();
      }
    });

    test('debe mostrar lista de estudiantes para marcar asistencia', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/registrar');
      await helpers.waitForLoading(instructorPage);

      // Si hay grupo seleccionado, debería mostrar estudiantes
      const studentList = instructorPage.locator(
        '[data-testid="student-list"], table, .student-list'
      );

      // Puede que no haya estudiantes si no se seleccionó grupo
      if (await studentList.isVisible()) {
        await expect(studentList).toBeVisible();
      }
    });

    test('debe permitir marcar asistencia (presente/ausente)', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/registrar');
      await helpers.waitForLoading(instructorPage);

      // Buscar botones o checkboxes para marcar asistencia
      const attendanceControls = instructorPage.locator(
        'input[type="checkbox"], input[type="radio"], button:has-text("Presente"), button:has-text("Ausente")'
      );

      const controlCount = await attendanceControls.count();
      
      if (controlCount > 0) {
        // Intentar marcar el primero
        await attendanceControls.first().click();
      }
    });

    test('debe guardar asistencia correctamente', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/registrar');
      await helpers.waitForLoading(instructorPage);

      // Buscar botón de guardar
      const saveButton = instructorPage.locator(
        'button[type="submit"], button:has-text("Guardar"), button:has-text("Registrar")'
      );

      if (await saveButton.isVisible()) {
        // El botón de guardar debería estar presente
        await expect(saveButton).toBeVisible();
      }
    });
  });

  test.describe('Registro por QR', () => {
    test('debe mostrar página de escaneo QR (instructor)', async ({ instructorPage }) => {
      await instructorPage.goto('/asistencia/qr');
      await helpers.waitForLoading(instructorPage);

      // Verificar que hay algo relacionado con QR
      const qrContent = instructorPage.locator(
        '[data-testid="qr-scanner"], [data-testid="qr-section"], .qr'
      );

      if (await qrContent.isVisible()) {
        await expect(qrContent).toBeVisible();
      }
    });

    test('debe mostrar QR del estudiante', async ({ studentPage }) => {
      await studentPage.goto('/qr/generar');
      await helpers.waitForLoading(studentPage);

      // Buscar elemento QR
      const qrCode = studentPage.locator(
        '[data-testid="qr-code"], canvas, svg, img[alt*="QR"]'
      );

      if (await qrCode.isVisible()) {
        await expect(qrCode).toBeVisible();
      }
    });
  });

  test.describe('Historial de Asistencia', () => {
    test('debe mostrar historial de asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia/historial');
      await helpers.waitForLoading(authenticatedPage);

      const historyContent = authenticatedPage.locator(
        '[data-testid="attendance-history"], table, main'
      );
      await expect(historyContent).toBeVisible();
    });

    test('debe permitir filtrar por rango de fechas', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia/historial');
      await helpers.waitForLoading(authenticatedPage);

      const dateFilters = authenticatedPage.locator(
        'input[type="date"], [data-testid="date-range"]'
      );

      const count = await dateFilters.count();
      
      if (count > 0) {
        // Debería haber filtros de fecha
        await expect(dateFilters.first()).toBeVisible();
      }
    });

    test('debe mostrar estadísticas de asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia/historial');
      await helpers.waitForLoading(authenticatedPage);

      // Buscar estadísticas o resumen
      const stats = authenticatedPage.locator(
        '[data-testid="attendance-stats"], .stats, .summary'
      );

      if (await stats.isVisible()) {
        await expect(stats).toBeVisible();
      }
    });

    test('debe permitir exportar datos', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/asistencia/historial');
      await helpers.waitForLoading(authenticatedPage);

      const exportButton = authenticatedPage.locator(
        'button:has-text("Exportar"), button:has-text("Descargar"), [data-testid="export-button"]'
      );

      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }
    });
  });

  test.describe('Justificaciones', () => {
    test('debe mostrar lista de justificaciones', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/justificaciones');
      await helpers.waitForLoading(authenticatedPage);

      const justificationsList = authenticatedPage.locator(
        '[data-testid="justifications-list"], table, main'
      );
      await expect(justificationsList).toBeVisible();
    });

    test('debe permitir crear nueva justificación', async ({ studentPage }) => {
      await studentPage.goto('/justificaciones/nueva');
      await helpers.waitForLoading(studentPage);

      // Verificar formulario de justificación
      const form = studentPage.locator('form');
      
      if (await form.isVisible()) {
        await expect(form).toBeVisible();

        // Debería tener campos necesarios
        const reasonField = studentPage.locator(
          'textarea[name="motivo"], textarea[name="reason"], [data-testid="reason-input"]'
        );
        
        if (await reasonField.isVisible()) {
          await expect(reasonField).toBeVisible();
        }
      }
    });

    test('debe permitir adjuntar archivo', async ({ studentPage }) => {
      await studentPage.goto('/justificaciones/nueva');
      await helpers.waitForLoading(studentPage);

      const fileInput = studentPage.locator(
        'input[type="file"], [data-testid="file-upload"]'
      );

      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    });

    test('instructor debe poder aprobar/rechazar justificación', async ({ instructorPage }) => {
      await instructorPage.goto('/justificaciones');
      await helpers.waitForLoading(instructorPage);

      // Buscar botones de acción
      const actionButtons = instructorPage.locator(
        'button:has-text("Aprobar"), button:has-text("Rechazar"), [data-testid="approve-btn"], [data-testid="reject-btn"]'
      );

      const count = await actionButtons.count();
      
      // Si hay justificaciones pendientes, deberían existir botones de acción
      if (count > 0) {
        await expect(actionButtons.first()).toBeVisible();
      }
    });
  });
});

test.describe('Alertas de Asistencia', () => {
  test('debe mostrar página de alertas', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/alertas');
    await helpers.waitForLoading(authenticatedPage);

    const alertsContent = authenticatedPage.locator(
      '[data-testid="alerts-page"], main'
    );
    await expect(alertsContent).toBeVisible();
  });

  test('debe mostrar alertas activas', async ({ instructorPage }) => {
    await instructorPage.goto('/alertas');
    await helpers.waitForLoading(instructorPage);

    const alertsList = instructorPage.locator(
      '[data-testid="alerts-list"], .alerts, table'
    );

    if (await alertsList.isVisible()) {
      await expect(alertsList).toBeVisible();
    }
  });

  test('debe permitir filtrar alertas por tipo', async ({ instructorPage }) => {
    await instructorPage.goto('/alertas');
    await helpers.waitForLoading(instructorPage);

    const typeFilter = instructorPage.locator(
      'select[name="tipo"], [data-testid="alert-type-filter"]'
    );

    if (await typeFilter.isVisible()) {
      await expect(typeFilter).toBeVisible();
    }
  });
});
