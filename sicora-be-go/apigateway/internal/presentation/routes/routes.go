package routes

import (
	"apigateway/internal/infrastructure/config"
	"apigateway/internal/infrastructure/logger"
	"apigateway/internal/presentation/handlers"
	"apigateway/internal/presentation/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRoutes configures all routes for the API Gateway
func SetupRoutes(
	router *gin.Engine,
	cfg *config.Config,
	log *logger.Logger,
	healthHandler *handlers.HealthHandler,
	proxyHandler *handlers.ProxyHandler,
) {
	// Health check endpoints (no auth required)
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)
	router.GET("/live", healthHandler.Live)
	router.GET("/services", healthHandler.Services)

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes (no auth)
		public := v1.Group("")
		{
			// Auth endpoints
			public.POST("/auth/login", proxyHandler.ProxyToService("userservice"))
			public.POST("/auth/register", proxyHandler.ProxyToService("userservice"))
			public.POST("/auth/refresh", proxyHandler.ProxyToService("userservice"))
			public.POST("/auth/forgot-password", proxyHandler.ProxyToService("userservice"))
			public.POST("/auth/reset-password", proxyHandler.ProxyToService("userservice"))
		}

		// Protected routes (auth required)
		protected := v1.Group("")
		protected.Use(middleware.Auth(cfg))
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("", proxyHandler.ProxyToService("userservice"))
				users.GET("/:id", proxyHandler.ProxyToService("userservice"))
				users.POST("", middleware.RequireRole("admin"), proxyHandler.ProxyToService("userservice"))
				users.PUT("/:id", proxyHandler.ProxyToService("userservice"))
				users.DELETE("/:id", middleware.RequireRole("admin"), proxyHandler.ProxyToService("userservice"))
				users.GET("/me", proxyHandler.ProxyToService("userservice"))
				users.PUT("/me", proxyHandler.ProxyToService("userservice"))
			}

			// Schedule routes
			schedules := protected.Group("/schedules")
			{
				schedules.GET("", proxyHandler.ProxyToService("scheduleservice"))
				schedules.GET("/:id", proxyHandler.ProxyToService("scheduleservice"))
				schedules.POST("", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("scheduleservice"))
				schedules.PUT("/:id", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("scheduleservice"))
				schedules.DELETE("/:id", middleware.RequireRole("admin"), proxyHandler.ProxyToService("scheduleservice"))
			}

			// Attendance routes
			attendance := protected.Group("/attendance")
			{
				attendance.GET("", proxyHandler.ProxyToService("attendanceservice"))
				attendance.GET("/:id", proxyHandler.ProxyToService("attendanceservice"))
				attendance.POST("", proxyHandler.ProxyToService("attendanceservice"))
				attendance.PUT("/:id", proxyHandler.ProxyToService("attendanceservice"))
				attendance.GET("/reports", proxyHandler.ProxyToService("attendanceservice"))
			}

			// Evaluation routes
			evaluations := protected.Group("/evaluations")
			{
				evaluations.GET("", proxyHandler.ProxyToService("evalinservice"))
				evaluations.GET("/:id", proxyHandler.ProxyToService("evalinservice"))
				evaluations.POST("", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("evalinservice"))
				evaluations.PUT("/:id", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("evalinservice"))
				evaluations.DELETE("/:id", middleware.RequireRole("admin"), proxyHandler.ProxyToService("evalinservice"))
			}

			// Knowledge Base routes
			kb := protected.Group("/knowledge")
			{
				kb.GET("/articles", proxyHandler.ProxyToService("kbservice"))
				kb.GET("/articles/:id", proxyHandler.ProxyToService("kbservice"))
				kb.POST("/articles", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("kbservice"))
				kb.PUT("/articles/:id", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("kbservice"))
				kb.DELETE("/articles/:id", middleware.RequireRole("admin"), proxyHandler.ProxyToService("kbservice"))
				kb.GET("/search", proxyHandler.ProxyToService("kbservice"))
			}

			// AI routes
			ai := protected.Group("/ai")
			{
				ai.POST("/chat", proxyHandler.ProxyToService("aiservice"))
				ai.POST("/recommendations", proxyHandler.ProxyToService("aiservice"))
				ai.POST("/analyze", proxyHandler.ProxyToService("aiservice"))
			}

			// Project evaluation routes
			projects := protected.Group("/projects")
			{
				projects.GET("", proxyHandler.ProxyToService("projectevalservice"))
				projects.GET("/:id", proxyHandler.ProxyToService("projectevalservice"))
				projects.POST("", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("projectevalservice"))
				projects.PUT("/:id", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("projectevalservice"))
				projects.DELETE("/:id", middleware.RequireRole("admin"), proxyHandler.ProxyToService("projectevalservice"))

				// Submissions
				projects.GET("/:id/submissions", proxyHandler.ProxyToService("projectevalservice"))
				projects.POST("/:id/submissions", proxyHandler.ProxyToService("projectevalservice"))
			}

			// Mobile evaluation routes
			meval := protected.Group("/meval")
			{
				meval.GET("/forms", proxyHandler.ProxyToService("mevalservice"))
				meval.GET("/forms/:id", proxyHandler.ProxyToService("mevalservice"))
				meval.POST("/forms", middleware.RequireRole("admin", "instructor"), proxyHandler.ProxyToService("mevalservice"))
				meval.POST("/submit", proxyHandler.ProxyToService("mevalservice"))
				meval.GET("/results", proxyHandler.ProxyToService("mevalservice"))
			}
		}
	}
}
