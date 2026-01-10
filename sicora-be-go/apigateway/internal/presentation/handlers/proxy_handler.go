package handlers

import (
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"apigateway/internal/infrastructure/config"
	"apigateway/internal/infrastructure/logger"

	"github.com/gin-gonic/gin"
)

// ProxyHandler handles reverse proxy to backend services
type ProxyHandler struct {
	cfg       *config.Config
	logger    *logger.Logger
	transport *http.Transport
}

// NewProxyHandler creates a new proxy handler
func NewProxyHandler(cfg *config.Config, logger *logger.Logger) *ProxyHandler {
	return &ProxyHandler{
		cfg:    cfg,
		logger: logger,
		transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
			DisableCompression:  true, // Let backend handle compression
		},
	}
}

// ProxyToService proxies requests to a specific service
func (h *ProxyHandler) ProxyToService(serviceName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceURL, exists := h.cfg.Services[serviceName]
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Service not found",
				"message": "Unknown service: " + serviceName,
			})
			return
		}

		target, err := url.Parse(serviceURL)
		if err != nil {
			h.logger.Error("Failed to parse service URL",
				"service", serviceName,
				"url", serviceURL,
				"error", err,
			)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to connect to service",
			})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(target)
		proxy.Transport = h.transport

		// Modify the request
		proxy.Director = func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			// Strip the service prefix from path
			// e.g., /api/v1/users/123 -> /api/v1/users/123
			req.URL.Path = c.Request.URL.Path
			req.URL.RawQuery = c.Request.URL.RawQuery

			// Forward headers
			req.Header = c.Request.Header.Clone()

			// Remove Accept-Encoding to avoid gzip issues with proxy
			req.Header.Del("Accept-Encoding")

			// Add gateway headers
			req.Header.Set("X-Forwarded-Host", c.Request.Host)
			req.Header.Set("X-Forwarded-For", c.ClientIP())
			req.Header.Set("X-Request-ID", c.GetString("request_id"))

			// Forward auth context
			if userID := c.GetString("user_id"); userID != "" {
				req.Header.Set("X-User-ID", userID)
			}
			if role := c.GetString("role"); role != "" {
				req.Header.Set("X-User-Role", role)
			}
		}

		// Custom error handler
		proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
			h.logger.Error("Proxy error",
				"service", serviceName,
				"error", err,
			)
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Bad Gateway",
				"message": "Service temporarily unavailable",
			})
		}

		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// SimpleProxy performs a simple HTTP proxy request
func (h *ProxyHandler) SimpleProxy(c *gin.Context, serviceName, path string) {
	serviceURL, exists := h.cfg.Services[serviceName]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Service not found",
		})
		return
	}

	targetURL := serviceURL + path
	if c.Request.URL.RawQuery != "" {
		targetURL += "?" + c.Request.URL.RawQuery
	}

	// Create proxy request
	proxyReq, err := http.NewRequest(c.Request.Method, targetURL, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create proxy request",
		})
		return
	}

	// Copy headers
	for key, values := range c.Request.Header {
		for _, value := range values {
			proxyReq.Header.Add(key, value)
		}
	}

	// Add gateway headers
	proxyReq.Header.Set("X-Forwarded-For", c.ClientIP())
	proxyReq.Header.Set("X-Request-ID", c.GetString("request_id"))

	// Execute request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		h.logger.Error("Proxy request failed",
			"service", serviceName,
			"error", err,
		)
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Service unavailable",
		})
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}

	// Copy response body
	c.Status(resp.StatusCode)
	io.Copy(c.Writer, resp.Body)
}

// GetServiceFromPath extracts service name from URL path
func GetServiceFromPath(path string) string {
	parts := strings.Split(strings.TrimPrefix(path, "/api/v1/"), "/")
	if len(parts) > 0 {
		switch parts[0] {
		case "users", "auth", "roles", "permissions":
			return "userservice"
		case "schedules", "calendar":
			return "scheduleservice"
		case "attendance":
			return "attendanceservice"
		case "evaluations", "competencies":
			return "evalinservice"
		case "knowledge", "kb", "articles":
			return "kbservice"
		case "ai", "chat", "recommendations":
			return "aiservice"
		case "projects", "submissions":
			return "projectevalservice"
		case "meval", "mobile":
			return "mevalservice"
		}
	}
	return ""
}
