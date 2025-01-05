package api

import "github.com/gin-gonic/gin"

func SetRoutes(r *gin.RouterGroup) {
	r.GET("/user-info", getUserInfo)
}

// TODO: 實作取得使用者資訊的 API
func getUserInfo(c *gin.Context) {
	c.JSON(200, gin.H{
		"username": "user",
		"email":    "",
	})
}
