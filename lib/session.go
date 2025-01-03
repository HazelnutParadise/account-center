package lib

import (
	"account/db"
	"account/obj"
	"time"

	"github.com/HazelnutParadise/Go-Utils/conv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func IsLoggedin(c *gin.Context) bool {
	session := sessions.Default(c)
	sessionID := session.Get("sessionID")

	if sessionID == nil {
		// 清除無效的 session
		session.Clear()
		return false
	}

	if !IsSessionActive(sessionID.(string)) {
		// 清除無效的 session
		session.Clear()
		return false
	}
	return true
}

func CreateSessionInDB(userID uint) string {
	sessionID := uuid.New().String()
	db.DB.Create(&obj.Session{
		ID:        sessionID,
		UserID:    conv.ToString(userID),
		CreatedAt: time.Now(),
		IsActive:  true,
	})
	return sessionID
}

func DisableSessionInDB(sessionID string) {
	db.DB.Model(&obj.Session{}).Where("id = ?", sessionID).Update("is_active", false)
}

func IsSessionActive(sessionID string) bool {
	var sessions []obj.Session
	db.DB.Find(&sessions, "id = ?", sessionID)
	if len(sessions) == 0 {
		return false
	}
	return sessions[0].IsActive
}
