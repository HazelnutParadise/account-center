package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

// Session 名稱
const SessionName = "sessionid"

// User 結構：示範用
type User struct {
	Username string
	Password string // 正式專案請改用雜湊
}

// 簡化的 in-memory user store: username -> User
// TODO: 改用資料庫持久化儲存
var userStore = map[string]User{}

func main() {
	r := gin.Default()

	// 設置模板渲染引擎
	r.LoadHTMLGlob("templates/*")

	// 1. 建立一個 Cookie-based Store (可改用 RedisStore…)
	sessionKey := os.Getenv("SESSION_KEY")
	if sessionKey == "" {
		// 若沒有設定 SESSION_KEY，就用預設 (僅限開發)
		sessionKey = "secret123!@#"
	}
	store := cookie.NewStore([]byte(sessionKey))
	store.Options(sessions.Options{
		Path:     "/",
		HttpOnly: true,
		// Secure: true,  // 若正式站走 HTTPS，務必開啟
		// SameSite: http.SameSiteStrictMode,
		MaxAge: 3600, // Session 有效期(秒)，可自行調整
	})

	// 2. 將 session middleware 註冊到 Gin
	r.Use(sessions.Sessions(SessionName, store))

	// 路由
	r.GET("/", homeHandler)
	r.POST("/register", registerHandler)
	r.POST("/login", loginHandler)
	r.GET("/profile", authRequired(), profileHandler) // 需要登入
	r.GET("/logout", logoutHandler)

	// 啟動 Server
	r.Run(":3331") // 監聽在 3331 port
}

// -------------------------
// 首頁 (GET /)
// -------------------------
func homeHandler(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("username")

	if username == nil {
		c.HTML(http.StatusOK, "login.html", nil)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  fmt.Sprintf("已登入, username = %s", username),
		"username": username,
	})
}

// -------------------------
// 註冊 (POST /register)
// Body JSON: { "username": "...", "password": "..." }
// -------------------------
func registerHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無效的參數格式"})
		return
	}

	// 簡易檢查
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "請填寫帳號與密碼"})
		return
	}

	// 檢查是否已存在
	if _, ok := userStore[req.Username]; ok {
		c.JSON(http.StatusConflict, gin.H{"error": "帳號已存在"})
		return
	}

	// 在正式專案中，請使用 bcrypt/argon2 雜湊後再儲存
	userStore[req.Username] = User{
		Username: req.Username,
		Password: req.Password,
	}

	c.JSON(http.StatusOK, gin.H{"message": "註冊成功"})
}

// -------------------------
// 登入 (POST /login)
// Body JSON: { "username": "...", "password": "..." }
// -------------------------
func loginHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無效的參數格式"})
		fmt.Println(err)
		return
	}

	user, ok := userStore[req.Username]
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "使用者不存在"})
		return
	}

	// 檢查密碼 (示範用明碼，比對)
	if user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "密碼錯誤"})
		return
	}

	// 成功後寫入 Session
	session := sessions.Default(c)
	session.Set("username", user.Username)
	// 可設定其他資訊，例如 userID, roles...
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法儲存 session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "登入成功"})
}

// -------------------------
// 受保護路由 (GET /profile)
// 需登入才能查看: 使用 "authRequired" middleware
// -------------------------
func profileHandler(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("username")

	// 顯示個人資訊 (示範: 只顯示 username)
	user := userStore[username.(string)]
	c.JSON(http.StatusOK, gin.H{
		"message":  "個人資訊",
		"username": user.Username,
		// 可加入更多屬性 (email, phone, roles...)
	})
}

// -------------------------
// 登出 (GET /logout)
// -------------------------
func logoutHandler(c *gin.Context) {
	session := sessions.Default(c)
	// 設定 session 過期
	session.Options(sessions.Options{
		MaxAge: -1,
	})
	// 清除 session
	session.Clear()
	session.Save()

	c.JSON(http.StatusOK, gin.H{"message": "登出成功"})
}

// -------------------------
// Middleware: authRequired
// 用於需要登入的路由
// -------------------------
func authRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		if session.Get("username") == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "尚未登入，無法存取"})
			c.Abort()
			return
		}
		c.Next()
	}
}
