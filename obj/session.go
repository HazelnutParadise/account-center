package obj

import "time"

type Session struct {
	ID        string `gorm:"primaryKey"`
	UserID    string
	CreatedAt time.Time
	IsActive  bool
}
