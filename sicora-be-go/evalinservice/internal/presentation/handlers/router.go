package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"evalinservice/internal/application/usecases"
	"evalinservice/internal/presentation/middleware"
)

// RouterConfig contiene la configuración para el router
type RouterConfig struct {
	Logger      *logrus.Logger
	JWTSecret   string
	Environment string
}

// HandlerContainer contiene todos los handlers de la aplicación
type HandlerContainer struct {
	Base          *BaseHandler
	Evaluation    *EvaluationHandler
	Question      *QuestionHandler
	Questionnaire *QuestionnaireHandler
	Period        *EvaluationPeriodHandler
	Comment       *CommentHandler
	Report        *ReportHandler
	Config        *ConfigurationHandler
}

// UseCaseContainer contiene todos los casos de uso
type UseCaseContainer struct {
	Evaluation    *usecases.EvaluationUseCase
	Question      *usecases.QuestionUseCase
	Questionnaire *usecases.QuestionnaireUseCase
	Period        *usecases.EvaluationPeriodUseCase
	Comment       *usecases.CommentUseCase
	Report        *usecases.ReportUseCase
	Config        *usecases.ConfigurationUseCase
	Notification  *usecases.NotificationUseCase
}

// NewHandlerContainer crea un nuevo contenedor de handlers
func NewHandlerContainer(logger *logrus.Logger, useCases *UseCaseContainer) *HandlerContainer {
	return &HandlerContainer{
		Base:          NewBaseHandler(logger),
		Evaluation:    NewEvaluationHandler(logger, useCases.Evaluation),
		Question:      NewQuestionHandler(logger, useCases.Question),
		Questionnaire: NewQuestionnaireHandler(logger, useCases.Questionnaire),
		Period:        NewEvaluationPeriodHandler(logger, useCases.Period),
		Comment:       NewCommentHandler(logger, useCases.Comment),
		Report:        NewReportHandler(logger, useCases.Report),
		Config:        NewConfigurationHandler(logger, useCases.Config),
	}
}

// SetupRoutes configura todas las rutas de la aplicación
func SetupRoutes(router *gin.Engine, config *RouterConfig, handlers *HandlerContainer) {
	// Configurar middlewares globales
	setupGlobalMiddleware(router, config)

	// Configurar rutas públicas
	setupPublicRoutes(router, handlers)

	// Configurar rutas autenticadas
	setupAuthenticatedRoutes(router, config, handlers)

	// Configurar rutas de administrador
	setupAdminRoutes(router, config, handlers)
}

// setupGlobalMiddleware configura middlewares que se aplican a todas las rutas
func setupGlobalMiddleware(router *gin.Engine, config *RouterConfig) {
	// CORS
	router.Use(middleware.CORS(middleware.DefaultCORSConfig()))

	// Security headers
	router.Use(middleware.SecurityHeaders())

	// Request ID
	router.Use(middleware.RequestID())

	// Logging
	loggingMiddleware := middleware.NewLoggingMiddleware(config.Logger)
	router.Use(loggingMiddleware.Logger())

	// Recovery
	router.Use(middleware.Recovery(config.Logger))

	// Rate limiting (básico)
	router.Use(middleware.RateLimiting())
}

// setupPublicRoutes configura rutas que no requieren autenticación
func setupPublicRoutes(router *gin.Engine, handlers *HandlerContainer) {
	// Health check
	router.GET("/health", handlers.Base.HealthCheck)
	router.GET("/api/health", handlers.Base.HealthCheck)

	// API version info
	router.GET("/api/v1", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service": "evalinservice",
			"version": "1.0.0",
			"status":  "running",
		})
	})
}

// setupAuthenticatedRoutes configura rutas que requieren autenticación
func setupAuthenticatedRoutes(router *gin.Engine, config *RouterConfig, handlers *HandlerContainer) {
	// Crear middleware de autenticación
	authMiddleware := middleware.NewAuthMiddleware(config.JWTSecret)

	// Grupo de rutas autenticadas
	api := router.Group("/api/v1")
	api.Use(authMiddleware.Authenticate())

	// Rutas de evaluaciones
	setupEvaluationRoutes(api, handlers, authMiddleware)

	// Rutas de preguntas
	setupQuestionRoutes(api, handlers, authMiddleware)

	// Rutas de cuestionarios
	setupQuestionnaireRoutes(api, handlers, authMiddleware)

	// Rutas de períodos
	setupPeriodRoutes(api, handlers, authMiddleware)

	// Rutas de comentarios
	setupCommentRoutes(api, handlers, authMiddleware)

	// Rutas de reportes
	setupReportRoutes(api, handlers, authMiddleware)
}

// setupAdminRoutes configura rutas que requieren permisos de administrador
func setupAdminRoutes(router *gin.Engine, config *RouterConfig, handlers *HandlerContainer) {
	authMiddleware := middleware.NewAuthMiddleware(config.JWTSecret)

	// Grupo de rutas de administrador
	admin := router.Group("/api/v1/admin")
	admin.Use(authMiddleware.Authenticate())
	admin.Use(authMiddleware.RequireRole("admin"))

	// Rutas administrativas
	setupAdminConfigRoutes(admin, handlers)
	setupAdminReportRoutes(admin, handlers)
	setupAdminUserRoutes(admin, handlers)
}

// setupEvaluationRoutes configura las rutas de evaluaciones
func setupEvaluationRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	evaluations := api.Group("/evaluations")

	// Rutas para estudiantes e instructores
	evaluations.POST("", handlers.Evaluation.CreateEvaluation)
	evaluations.GET("/my", handlers.Evaluation.GetMyEvaluations)
	evaluations.GET("/:id", handlers.Evaluation.GetEvaluationByID)
	evaluations.PUT("/:id", handlers.Evaluation.UpdateEvaluation)
	evaluations.POST("/:id/submit", handlers.Evaluation.SubmitEvaluation)

	// Rutas específicas para instructores
	instructorEvals := evaluations.Group("/instructor")
	instructorEvals.Use(authMiddleware.RequireRole("instructor", "admin"))
	instructorEvals.GET("/:instructor_id", handlers.Evaluation.GetEvaluationsByInstructorHandler)

	// Rutas de estadísticas (admin y instructores)
	stats := evaluations.Group("/stats")
	stats.Use(authMiddleware.RequireRole("admin", "instructor"))
	stats.GET("", handlers.Evaluation.GetEvaluationStats)
}

// setupQuestionRoutes configura las rutas de preguntas
func setupQuestionRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	questions := api.Group("/questions")

	// Rutas públicas para usuarios autenticados
	questions.GET("", handlers.Question.GetAllQuestions)
	questions.GET("/active", handlers.Question.GetActiveQuestions)
	questions.GET("/category/:category", handlers.Question.GetQuestionsByCategory)
	questions.GET("/:id", handlers.Question.GetQuestionByID)

	// Rutas administrativas
	adminQuestions := questions.Group("")
	adminQuestions.Use(authMiddleware.RequireRole("admin"))
	adminQuestions.POST("", handlers.Question.CreateQuestion)
	adminQuestions.PUT("/:id", handlers.Question.UpdateQuestion)
	adminQuestions.DELETE("/:id", handlers.Question.DeleteQuestion)
}

// setupQuestionnaireRoutes configura las rutas de cuestionarios
func setupQuestionnaireRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	questionnaires := api.Group("/questionnaires")

	// Rutas públicas para usuarios autenticados
	questionnaires.GET("", handlers.Questionnaire.GetAllQuestionnaires)
	questionnaires.GET("/active", handlers.Questionnaire.GetActiveQuestionnaires)
	questionnaires.GET("/:id", handlers.Questionnaire.GetQuestionnaireByID)

	// Rutas administrativas
	adminQuestionnaires := questionnaires.Group("")
	adminQuestionnaires.Use(authMiddleware.RequireRole("admin"))
	adminQuestionnaires.POST("", handlers.Questionnaire.CreateQuestionnaire)
	adminQuestionnaires.PUT("/:id", handlers.Questionnaire.UpdateQuestionnaire)
	adminQuestionnaires.DELETE("/:id", handlers.Questionnaire.DeleteQuestionnaire)
}

// setupPeriodRoutes configura las rutas de períodos de evaluación
func setupPeriodRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	periods := api.Group("/periods")

	// Rutas públicas para usuarios autenticados
	periods.GET("/active", handlers.Period.GetActivePeriods)
	periods.GET("/current", handlers.Period.GetCurrentPeriods)
	periods.GET("/:id", handlers.Period.GetPeriodByID)
	periods.GET("/ficha/:ficha_id", handlers.Period.GetPeriodsByFicha)
	periods.GET("/:id/evaluations", handlers.Period.GetPeriodEvaluations)

	// Rutas para instructores
	instructorPeriods := periods.Group("/instructor")
	instructorPeriods.Use(authMiddleware.RequireRole("instructor", "admin"))
	instructorPeriods.GET("/:instructor_id", handlers.Period.GetPeriodsForInstructor)

	// Rutas administrativas
	adminPeriods := periods.Group("")
	adminPeriods.Use(authMiddleware.RequireRole("admin"))
	adminPeriods.POST("", handlers.Period.CreatePeriod)
	adminPeriods.PUT("/:id", handlers.Period.UpdatePeriod)
	adminPeriods.DELETE("/:id", handlers.Period.DeletePeriod)
	adminPeriods.GET("/:id/stats", handlers.Period.GetPeriodStats)
}

// setupCommentRoutes configura las rutas de comentarios
func setupCommentRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	comments := api.Group("/comments")

	// Rutas para usuarios autenticados
	comments.POST("", handlers.Comment.CreateComment)
	comments.GET("/:id", handlers.Comment.GetCommentByID)
	comments.GET("/evaluation/:evaluation_id", handlers.Comment.GetCommentsByEvaluation)
	comments.PUT("/:id", handlers.Comment.UpdateComment)
	comments.DELETE("/:id", handlers.Comment.DeleteComment)

	// Rutas de estadísticas (admin e instructores)
	stats := comments.Group("/stats")
	stats.Use(authMiddleware.RequireRole("admin", "instructor"))
	stats.GET("", handlers.Comment.GetCommentStats)
}

// setupReportRoutes configura las rutas de reportes
func setupReportRoutes(api *gin.RouterGroup, handlers *HandlerContainer, authMiddleware *middleware.AuthMiddleware) {
	reports := api.Group("/reports")

	// Solo admin e instructores pueden acceder a reportes
	reports.Use(authMiddleware.RequireRole("admin", "instructor"))

	// Rutas básicas de reportes
	reports.POST("", handlers.Report.CreateReport)
	reports.GET("/:id", handlers.Report.GetReportByID)
	reports.PUT("/:id", handlers.Report.UpdateReport)
	reports.DELETE("/:id", handlers.Report.DeleteReport)

	// Rutas específicas de reportes
	reports.GET("/period/:period_id", handlers.Report.GetReportsByPeriod)
	reports.GET("/pending", handlers.Report.GetPendingReports)
	reports.GET("/my", handlers.Report.GetMyReports)
	reports.GET("/filter", handlers.Report.GetReportsByFilter)

	// Operaciones de generación y descarga
	reports.POST("/generate", handlers.Report.GenerateReport)
	reports.GET("/:id/download", handlers.Report.DownloadReport)
	reports.GET("/:id/status", handlers.Report.GetReportStatus)

	// Estadísticas (solo admin)
	adminReports := reports.Group("/stats")
	adminReports.Use(authMiddleware.RequireRole("admin"))
	adminReports.GET("", handlers.Report.GetReportStats)
}

// setupAdminConfigRoutes configura las rutas administrativas de configuración
func setupAdminConfigRoutes(admin *gin.RouterGroup, handlers *HandlerContainer) {
	config := admin.Group("/config")

	// Rutas CRUD de configuración
	config.POST("", handlers.Config.CreateConfiguration)
	config.GET("", handlers.Config.GetAllConfigurations)
	config.GET("/active", handlers.Config.GetActiveConfigurations)
	config.GET("/:id", handlers.Config.GetConfigurationByID)
	config.GET("/key/:key", handlers.Config.GetConfigurationByKey)
	config.GET("/category/:category", handlers.Config.GetConfigurationsByCategory)
	config.PUT("/:id", handlers.Config.UpdateConfiguration)
	config.DELETE("/:id", handlers.Config.DeleteConfiguration)

	// Operaciones especiales
	config.POST("/bulk-update", handlers.Config.BulkUpdateConfigurations)
	config.GET("/value/:key", handlers.Config.GetValueByKey)
}

// setupAdminReportRoutes configura las rutas administrativas de reportes
func setupAdminReportRoutes(admin *gin.RouterGroup, handlers *HandlerContainer) {
	reports := admin.Group("/reports")

	// Rutas administrativas específicas de reportes
	reports.GET("/all", handlers.Report.GetReportsByFilter)
	reports.GET("/stats/global", handlers.Report.GetReportStats)
	reports.POST("/generate/bulk", handlers.Report.GenerateReport)
}

// setupAdminUserRoutes configura las rutas administrativas de usuarios
func setupAdminUserRoutes(admin *gin.RouterGroup, handlers *HandlerContainer) {
	users := admin.Group("/users")

	// Placeholder para integración con servicio de usuarios
	users.GET("", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "User management integrated with user service",
			"note":    "Use user service endpoints for user operations",
		})
	})

	// Rutas específicas de evaluación de usuarios
	users.GET("/:id/evaluations", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Get user evaluations - to be implemented"})
	})

	users.GET("/:id/reports", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Get user reports - to be implemented"})
	})
}
