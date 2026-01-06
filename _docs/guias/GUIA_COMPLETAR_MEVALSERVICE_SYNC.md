# 🔧 Guía para Completar Sincronización mevalservice

**Fecha**: 2025-01-23  
**Estado**: ~40 errores pendientes  
**Servicios funcionando**: userservice ✅, evalinservice ✅

---

## 📊 Resumen del Problema

Las entidades de mevalservice fueron refactorizadas para el **Acuerdo OneVision 009/2024**, pero las capas inferiores (repositorios de infraestructura, handlers, jobs) aún usan la estructura antigua.

---

## 🗂️ Archivos con Errores Pendientes

### 1. `internal/infrastructure/repositories/repository_implementations.go`

**Problema**: improvementPlanRepository usa campos obsoletos

**Errores**:

- `plan.Title undefined` → entity ya no tiene Title
- `plan.Description undefined` → entity ya no tiene Description
- `plan.Resources undefined` → entity ya no tiene Resources
- `plan.Timeline undefined` → entity ya no tiene Timeline
- Objectives/Activities no pueden convertirse directamente a datatypes.JSON

**Solución**:

```go
// Actualizar toModel para ImprovementPlan
func (r *improvementPlanRepository) toModel(plan *entities.ImprovementPlan) *database.ImprovementPlanModel {
    // Convertir slices a JSON
    objectivesJSON, _ := json.Marshal(plan.Objectives)
    activitiesJSON, _ := json.Marshal(plan.Activities)
    successCriteriaJSON, _ := json.Marshal(plan.SuccessCriteria)

    return &database.ImprovementPlanModel{
        ID:                      plan.ID,
        StudentID:               plan.StudentID,
        StudentCaseID:           plan.StudentCaseID,
        PlanType:                string(plan.PlanType),
        StartDate:               plan.StartDate,
        EndDate:                 plan.EndDate,
        Objectives:              objectivesJSON,
        Activities:              activitiesJSON,
        SuccessCriteria:         successCriteriaJSON,
        ResponsibleInstructorID: plan.ResponsibleInstructorID,
        CurrentStatus:           string(plan.CurrentStatus),
        CompliancePercentage:    plan.CompliancePercentage,
        FinalEvaluation:         plan.FinalEvaluation,
        CreatedAt:               plan.CreatedAt,
        UpdatedAt:               plan.UpdatedAt,
    }
}
```

**Agregar métodos faltantes**:

- `GetActivePlans(ctx) ([]*entities.ImprovementPlan, error)`
- `GetByStudentID(ctx, studentID) ([]*entities.ImprovementPlan, error)`
- etc. (ver interfaz en repositories.go)

---

### 2. `internal/presentation/handlers/handlers.go`

**Problema**: Handlers llaman métodos de UseCase que ya no existen

**Errores**:

- `GetCommitteesByCenter undefined` → eliminar o mapear a GetByProgramID
- `GetOverdueStudentCases undefined` → eliminar o agregar a StudentCaseUseCases
- `ActivateSanction undefined` → reemplazar por UpdateComplianceStatus
- `CompleteSanction undefined` → reemplazar por UpdateComplianceStatus
- `ProcessAppeal undefined` → reemplazar por SetFinalDecision
- `Success field in SuccessResponse` → SuccessResponse solo tiene Message y Data

**Solución**:

```go
// Reemplazar llamadas:
// Antes:
h.committeeUC.GetCommitteesByCenter(ctx, center)
// Después:
h.committeeUC.GetAllCommittees(ctx, 100, 0) // y filtrar por programID en el handler

// Antes:
h.sanctionUC.ActivateSanction(ctx, id)
// Después:
h.sanctionUC.UpdateComplianceStatus(ctx, id, "IN_PROGRESS")

// Antes:
h.sanctionUC.CompleteSanction(ctx, id)
// Después:
h.sanctionUC.UpdateComplianceStatus(ctx, id, "COMPLETED")

// Antes:
h.appealUC.ProcessAppeal(ctx, id, accepted, resolution)
// Después:
if accepted {
    h.appealUC.AdmitAppeal(ctx, id, resolution)
} else {
    h.appealUC.RejectAppeal(ctx, id, resolution)
}

// Antes:
c.JSON(http.StatusOK, dto.SuccessResponse{Success: true, Message: "OK"})
// Después:
c.JSON(http.StatusOK, dto.SuccessResponse{Message: "OK"})
```

**Líneas específicas para actualizar**:

- Línea 114: `GetAllCommittees(ctx)` → `GetAllCommittees(ctx, 100, 0)`
- Línea 146: Eliminar o reemplazar `GetCommitteesByCenter`
- Línea 437: Eliminar o agregar `GetOverdueStudentCases` al use case
- Línea 746, 908, 952, 1133: Quitar campo `Success` de SuccessResponse
- Línea 891: Reemplazar `ActivateSanction` por `UpdateComplianceStatus`
- Línea 935: Reemplazar `CompleteSanction` por `UpdateComplianceStatus`
- Línea 1111: Reemplazar `ProcessAppeal` por `AdmitAppeal/RejectAppeal`

---

### 3. `internal/jobs/scheduler.go`

**Problema**: Struct literals usan campos obsoletos de Committee

**Errores**:

- `committee.Center undefined`
- `Name, Type, SubType, Center` fields no existen
- `CommitteeStatusActive` → usar `CommitteeStatusScheduled` o `CommitteeStatusInProgress`
- `StartDate, EndDate` → usar `CommitteeDate`

**Solución**:

```go
// Actualizar llamada a GetAll
// Antes:
committees, _ := js.committeeRepo.GetAll(ctx)
// Después:
committees, _ := js.committeeRepo.GetAll(ctx, 100, 0)

// Actualizar struct literals
// Antes:
committee := &entities.Committee{
    Name:     "Monthly Committee",
    Type:     entities.CommitteeTypeEvaluation,
    SubType:  entities.CommitteeSubType,
    Center:   "Centro Principal",
    Status:   entities.CommitteeStatusActive,
    StartDate: time.Now(),
    EndDate:  time.Now().AddDate(0, 1, 0),
}
// Después:
committee := &entities.Committee{
    CommitteeDate:  time.Now(),
    CommitteeType:  entities.CommitteeTypeEvaluation,
    Status:         entities.CommitteeStatusScheduled,
    AcademicPeriod: "2024-I",
}

// Reemplazar referencias a Center
// Antes:
if committee.Center == "..." { ... }
// Después:
if committee.ProgramID != nil { ... }
```

---

## ✅ Capas YA Sincronizadas

Las siguientes capas ya están sincronizadas con las nuevas entidades:

1. **entities/** - Refactorizadas para Acuerdo 009/2024 ✅
2. **application/dto/dto.go** - Todos los DTOs actualizados ✅
3. **application/usecases/usecases.go** - Interfaces e implementaciones ✅
4. **infrastructure/database/models.go** - Modelos GORM actualizados ✅
5. **infrastructure/repositories/committee_repository.go** - Sincronizado ✅

---

## 📋 Orden de Trabajo Recomendado

1. **repository_implementations.go** (prioridad alta)

   - Agregar import de `encoding/json`
   - Actualizar `toModel()` y `toEntity()` para ImprovementPlan
   - Agregar métodos faltantes a la implementación

2. **handlers.go** (prioridad alta)

   - Actualizar llamadas a GetAllCommittees con params (limit, offset)
   - Reemplazar métodos de sanction/appeal obsoletos
   - Quitar campo Success de SuccessResponse

3. **scheduler.go** (prioridad media)
   - Actualizar struct literals de Committee
   - Actualizar llamadas a repositorios

---

## 🛠️ Comandos de Verificación

```bash
# Ver errores específicos
cd sicora-be-go/mevalservice && go build ./... 2>&1 | grep -E "\.go:[0-9]+:"

# Contar errores
cd sicora-be-go/mevalservice && go build ./... 2>&1 | wc -l

# Verificar después de cada cambio
cd sicora-be-go/mevalservice && go build ./...
```

---

## 📊 Métricas de Progreso

| Componente                 | Errores Iniciales | Estado        |
| -------------------------- | ----------------- | ------------- |
| DTOs                       | ~40               | ✅ Completado |
| UseCases                   | ~30               | ✅ Completado |
| Models                     | ~20               | ✅ Completado |
| committee_repository       | ~15               | ✅ Completado |
| repository_implementations | ~15               | 🚧 Pendiente  |
| handlers                   | ~10               | 🚧 Pendiente  |
| scheduler                  | ~10               | 🚧 Pendiente  |

**Total actual**: ~40 errores (de ~130 iniciales)

---

_Documento generado para facilitar la continuación del trabajo de sincronización._
