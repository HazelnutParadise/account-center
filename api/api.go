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
	session := sessions.Default(c)
	sessionID := session.Get("sessionID").(string)
	var sessionInDB obj.Session
	db.DB.First(&sessionInDB, "id = ?", sessionID)

	userID := sessionInDB.UserID
	var user obj.User
	db.DB.First(&user, "id = ?", userID)

	lib.FastJSON(c, 200, struct {
		Username string
		Phone    string
		Nickname string
		Email    string
	}{
		Username: user.Username,
		Phone:    user.Phone,
		Nickname: user.Nickname,
		Email:    user.Email,
	})
}
