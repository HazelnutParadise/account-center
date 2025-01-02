package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/HazelnutParadise/Go-Utils/hashutil"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

// 一天的秒數
const DAY = 24 * 3600

const supportDocsLink = "https://support.hazelnut-paradise.com/?category_id=2&category_name=%e6%9c%83%e5%93%a1%e8%88%87%e5%b8%b3%e8%99%9f"

// Session 名稱
const sessionName = "sessionid"

// User 結構：示範用
type User struct {
	Username string
	Password string // 正式專案請改用雜湊
	Salt     string
	Email    string
	Phone    string
	Nickname string
}

// 簡化的 in-memory user store: username -> User
// TODO: 改用資料庫持久化儲存
var userStore = map[string]User{}

func main() {
	// gin.SetMode(gin.ReleaseMode)
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
		MaxAge:   30 * DAY, // Session 有效期(秒)，可自行調整
		SameSite: http.SameSiteNoneMode,
	})

	// 2. 將 session middleware 註冊到 Gin
	r.Use(sessions.Sessions(sessionName, store))

	// 路由
	r.GET("/", homeHandler)
	r.GET("/register", registerPageHandler)
	r.POST("/register", registerHandler)
	r.GET("/login", loginPageHandler)
	r.POST("/login", loginHandler)
	r.GET("/profile", authRequired(), profileHandler) // 需要登入
	r.GET("/logout", logoutHandler)

	// 啟動 Server
	err := r.Run(":3331") // 監聽在 3331 port
	if err != nil {
		panic(err)
	}
}

// -------------------------
// 首頁 (GET /)
// -------------------------
func homeHandler(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("username")

	if username == nil {
		c.Redirect(http.StatusFound, "/login")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  fmt.Sprintf("已登入, username = %s", username),
		"username": username,
	})
}

func registerPageHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "register.html", struct {
		SupportDocsLink string
	}{
		SupportDocsLink: supportDocsLink,
	})
}

// -------------------------
// 註冊 (POST /register)
// Body JSON: { "username": "...", "password": "..." }
// -------------------------
func registerHandler(c *gin.Context) {
	var req struct {
		Username        string `json:"username"`
		Password        string `json:"password"`
		PasswordConfirm string `json:"password_confirm"`
		Email           string `json:"email"`
		Phone           string `json:"phone"`
		Nickname        string `json:"nickname"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無效的參數格式"})
		return
	}

	// 簡易檢查
	for _, v := range []string{req.Username, req.Password, req.Email, req.Phone, req.Nickname} {
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "請填寫所有欄位"})
			return
		}
	}

	// 密碼確認
	if req.Password != req.PasswordConfirm {
		c.JSON(http.StatusBadRequest, gin.H{"error": "密碼確認不相符"})
		return
	}

	// 檢查是否已存在
	if _, ok := userStore[req.Username]; ok {
		c.JSON(http.StatusConflict, gin.H{"error": "帳號已存在"})
		return
	}

	// 雜湊密碼
	hashedPassword, hashSalt, err := hashutil.Hash(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法雜湊密碼"})
		return
	}

	// 在正式專案中，請使用 bcrypt/argon2 雜湊後再儲存
	userStore[req.Username] = User{
		Username: req.Username,
		Password: hashedPassword,
		Salt:     hashSalt,
		Email:    req.Email,
		Phone:    req.Phone,
		Nickname: req.Nickname,
	}

	c.JSON(http.StatusOK, gin.H{"message": "註冊成功"})
}

func loginPageHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", struct {
		SupportDocsLink string
	}{
		SupportDocsLink: supportDocsLink,
	})
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

	// 檢查密碼
	if !hashutil.CompareHash(req.Password, user.Password, user.Salt) {
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
	username := session.Get("username").(string)

	// 顯示個人資訊 (示範: 只顯示 username)
	user := userStore[username]
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
