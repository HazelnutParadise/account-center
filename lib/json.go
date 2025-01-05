package lib

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
)

var json = jsoniter.ConfigFastest

func FastJSON(c *gin.Context, code int, obj any) {
	// 序列化數據
	data, err := json.Marshal(obj)
	if err != nil {
		// 返回具體的錯誤描述，幫助調試
		c.AbortWithStatusJSON(http.StatusInternalServerError, JsonError{
			Error: fmt.Sprintf("JSON serialization error: %v", err),
		})
		return
	}

	// 設置 Header 必須在 WriteHeader 之前
	c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")

	// 返回狀態碼
	c.Writer.WriteHeader(code)

	// 寫入數據，檢查錯誤
	if _, writeErr := c.Writer.Write(data); writeErr != nil {
		// 如果寫入失敗，記錄錯誤
		c.Error(writeErr) // Gin 的內建錯誤記錄
	}
}

type JsonError struct {
	Error string `json:"error"`
}

type JsonMessage struct {
	Message string `json:"message"`
}
