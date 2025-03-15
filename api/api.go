package api

import (
	"account/db"
	"account/lib"
	"account/obj"
	"encoding/json"
	"sync"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SetRoutes(r *gin.RouterGroup, registerDataBuf *sync.Map, emailVerifyCodeBuf *sync.Map) {
	r.GET("/user-info", getUserInfo)
	r.POST("/verify-email", func(c *gin.Context) {
		verifyEmail(c, registerDataBuf, emailVerifyCodeBuf)
	})
}

func getUserInfo(c *gin.Context) {
	var isLoggedIn bool
	var user = obj.User{}
	session := sessions.Default(c)
	sessionID := session.Get("sessionID").(string)
	if sessionID != "" && lib.IsSessionActive(sessionID) {
		isLoggedIn = true

		var sessionInDB obj.Session
		db.DB.First(&sessionInDB, "id = ?", sessionID)

		userID := sessionInDB.UserID
		db.DB.First(&user, "id = ?", userID)
	}
	type userInfo struct {
		Username string `json:"username"`
		Phone    string `json:"phone"`
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
	}
	lib.FastJSON(c, 200, struct {
		IsLoggedIn bool     `json:"isLoggedIn"`
		Info       userInfo `json:"info"`
	}{
		IsLoggedIn: isLoggedIn,
		Info: userInfo{
			Username: user.Username,
			Phone:    user.Phone,
			Nickname: user.Nickname,
			Email:    user.Email,
		},
	})
}

func verifyEmail(c *gin.Context, registerDataBuf *sync.Map, emailVerifyCodeBuf *sync.Map) {
	// todo: 完成驗證並將資料存到資料庫
	var verifyData = struct {
		Type      string `json:"type"`
		DataUUID  string `json:"dataUUID"`
		InputCode string `json:"inputCode"`
	}{}
	err := json.NewDecoder(c.Request.Body).Decode(&verifyData)
	if err != nil {
		lib.FastJSON(c, 400, struct {
			Error string `json:"error"`
		}{
			Error: "Invalid request body",
		})
		return
	}

}
