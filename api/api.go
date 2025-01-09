package api

import (
	"account/db"
	"account/lib"
	"account/obj"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SetRoutes(r *gin.RouterGroup) {
	r.GET("/user-info", getUserInfo)
}

func getUserInfo(c *gin.Context) {
	var isLogin bool
	var user = obj.User{}
	session := sessions.Default(c)
	sessionID := session.Get("sessionID").(string)
	if sessionID != "" && lib.IsSessionActive(sessionID) {
		isLogin = true

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
		IsLogin bool     `json:"isLogin"`
		Info    userInfo `json:"info"`
	}{
		IsLogin: isLogin,
		Info: userInfo{
			Username: user.Username,
			Phone:    user.Phone,
			Nickname: user.Nickname,
			Email:    user.Email,
		},
	})
}
