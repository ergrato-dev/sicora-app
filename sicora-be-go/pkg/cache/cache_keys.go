package cache

import (
	"fmt"
	"time"
)

// Service prefixes for key namespacing.
const (
	PrefixScheduleService = "scheduleservice:"
	PrefixUserService     = "userservice:"
	PrefixKbService       = "kbservice:"
	PrefixEvalinService   = "evalinservice:"
	PrefixMevalService    = "mevalservice:"
	PrefixAIService       = "aiservice:"
	PrefixAPIGateway      = "apigateway:"
)

// Default TTL values based on data stability.
const (
	TTLVeryStable = 24 * time.Hour   // Campus, Venues
	TTLStable     = 12 * time.Hour   // Programs, Categories
	TTLSemiStable = 6 * time.Hour    // Groups, Templates
	TTLModerate   = 1 * time.Hour    // Schedules, Periods
	TTLDynamic    = 30 * time.Minute // Users, Search
	TTLShortLived = 15 * time.Minute // AI Responses
	TTLVeryShort  = 5 * time.Minute  // Rate Limiting
)

// ScheduleKeys provides key builders for ScheduleService.
type ScheduleKeys struct{}

func Schedule() ScheduleKeys { return ScheduleKeys{} }

func (ScheduleKeys) Campus(id string) string            { return fmt.Sprintf("campus:%s", id) }
func (ScheduleKeys) CampusAll() string                  { return "campus:all" }
func (ScheduleKeys) CampusActive() string               { return "campus:active" }
func (ScheduleKeys) Program(id string) string           { return fmt.Sprintf("program:%s", id) }
func (ScheduleKeys) ProgramAll() string                 { return "program:all" }
func (ScheduleKeys) ProgramActive() string              { return "program:active" }
func (ScheduleKeys) ProgramByType(t string) string      { return fmt.Sprintf("program:type:%s", t) }
func (ScheduleKeys) Group(id string) string             { return fmt.Sprintf("group:%s", id) }
func (ScheduleKeys) GroupByNumber(n string) string      { return fmt.Sprintf("group:number:%s", n) }
func (ScheduleKeys) GroupsByProgram(pid string) string  { return fmt.Sprintf("group:program:%s", pid) }
func (ScheduleKeys) GroupsActive() string               { return "group:active" }
func (ScheduleKeys) Venue(id string) string             { return fmt.Sprintf("venue:%s", id) }
func (ScheduleKeys) VenueAll() string                   { return "venue:all" }
func (ScheduleKeys) VenuesByCampus(cid string) string   { return fmt.Sprintf("venue:campus:%s", cid) }
func (ScheduleKeys) VenuesByType(t string) string       { return fmt.Sprintf("venue:type:%s", t) }
func (ScheduleKeys) ScheduleByID(id string) string      { return fmt.Sprintf("schedule:%s", id) }
func (ScheduleKeys) SchedulesByGroup(gid string) string { return fmt.Sprintf("schedule:group:%s", gid) }
func (ScheduleKeys) SchedulesByInstructor(iid string) string {
	return fmt.Sprintf("schedule:instructor:%s", iid)
}
func (ScheduleKeys) SchedulesByVenue(vid string) string { return fmt.Sprintf("schedule:venue:%s", vid) }

// UserKeys provides key builders for UserService.
type UserKeys struct{}

func User() UserKeys { return UserKeys{} }

func (UserKeys) ByID(id string) string        { return fmt.Sprintf("user:%s", id) }
func (UserKeys) ByDocument(doc string) string { return fmt.Sprintf("user:document:%s", doc) }
func (UserKeys) ByEmail(email string) string  { return fmt.Sprintf("user:email:%s", email) }
func (UserKeys) ByGroup(gid string) string    { return fmt.Sprintf("users:group:%s", gid) }
func (UserKeys) ByRole(role string) string    { return fmt.Sprintf("users:role:%s", role) }
func (UserKeys) InstructorsActive() string    { return "users:instructors:active" }
func (UserKeys) ApprenticesActive() string    { return "users:apprentices:active" }
func (UserKeys) Profile(uid string) string    { return fmt.Sprintf("user:profile:%s", uid) }

// KbKeys provides key builders for KbService.
type KbKeys struct{}

func Kb() KbKeys { return KbKeys{} }

func (KbKeys) FAQ(id string) string             { return fmt.Sprintf("faq:%s", id) }
func (KbKeys) FAQsByCategory(cat string) string { return fmt.Sprintf("faq:category:%s", cat) }
func (KbKeys) FAQsAll() string                  { return "faq:all" }
func (KbKeys) FAQsActive() string               { return "faq:active" }
func (KbKeys) Category(id string) string        { return fmt.Sprintf("category:%s", id) }
func (KbKeys) CategoriesAll() string            { return "category:all" }
func (KbKeys) SearchResult(hash string) string  { return fmt.Sprintf("search:%s", hash) }
func (KbKeys) PopularSearches() string          { return "search:popular" }

// EvalinKeys provides key builders for EvalinService.
type EvalinKeys struct{}

func Evalin() EvalinKeys { return EvalinKeys{} }

func (EvalinKeys) FormTemplate(id string) string { return fmt.Sprintf("form:template:%s", id) }
func (EvalinKeys) FormTemplatesAll() string      { return "form:template:all" }
func (EvalinKeys) Criteria(id string) string     { return fmt.Sprintf("criteria:%s", id) }
func (EvalinKeys) CriteriaAll() string           { return "criteria:all" }
func (EvalinKeys) PeriodActive() string          { return "period:active" }
func (EvalinKeys) PeriodByID(id string) string   { return fmt.Sprintf("period:%s", id) }

// MevalKeys provides key builders for MevalService.
type MevalKeys struct{}

func Meval() MevalKeys { return MevalKeys{} }

func (MevalKeys) FaultTypes() string         { return "fault:types" }
func (MevalKeys) FaultType(id string) string { return fmt.Sprintf("fault:type:%s", id) }
func (MevalKeys) Config() string             { return "config" }
func (MevalKeys) SanctionTypes() string      { return "sanction:types" }

// GatewayKeys provides key builders for API Gateway.
type GatewayKeys struct{}

func Gateway() GatewayKeys { return GatewayKeys{} }

func (GatewayKeys) RateLimit(clientIP string) string { return fmt.Sprintf("ratelimit:%s", clientIP) }
func (GatewayKeys) RateLimitUser(userID string) string {
	return fmt.Sprintf("ratelimit:user:%s", userID)
}
func (GatewayKeys) Session(sessionID string) string     { return fmt.Sprintf("session:%s", sessionID) }
func (GatewayKeys) UserSessions(userID string) string   { return fmt.Sprintf("sessions:user:%s", userID) }
func (GatewayKeys) TokenBlacklist(jti string) string    { return fmt.Sprintf("blacklist:%s", jti) }
func (GatewayKeys) RefreshToken(tokenID string) string  { return fmt.Sprintf("refresh:%s", tokenID) }
func (GatewayKeys) APIKey(keyHash string) string        { return fmt.Sprintf("apikey:%s", keyHash) }
func (GatewayKeys) ServiceHealth(service string) string { return fmt.Sprintf("health:%s", service) }

// Patterns for bulk operations
type Patterns struct{}

func Pattern() Patterns { return Patterns{} }

func (Patterns) AllCampuses() string  { return "campus:*" }
func (Patterns) AllPrograms() string  { return "program:*" }
func (Patterns) AllGroups() string    { return "group:*" }
func (Patterns) AllVenues() string    { return "venue:*" }
func (Patterns) AllSchedules() string { return "schedule:*" }
func (Patterns) AllUsers() string     { return "user:*" }
func (Patterns) AllFAQs() string      { return "faq:*" }
func (Patterns) AllSearches() string  { return "search:*" }
func (Patterns) Everything() string   { return "*" }
