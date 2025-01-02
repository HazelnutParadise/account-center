package obj

// User 結構：示範用
type User struct {
	ID       string
	Username string
	Password string // 正式專案請改用雜湊
	Salt     string
	Email    string
	Phone    string
	Nickname string
}
