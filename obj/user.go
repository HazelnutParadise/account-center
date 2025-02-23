package obj

// User 結構：示範用
type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"unique"`
	Password string
	Salt     string
	Email    string `gorm:"unique"`
	Phone    string `gorm:"unique"`
	Nickname string
	Bio      string
	Sessions []Session `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
