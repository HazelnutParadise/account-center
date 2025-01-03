package db

import (
	"account/obj"
	"fmt"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func init() {
	dbDir := "./databases"
	_, err := os.Stat(dbDir)
	if os.IsNotExist(err) {
		os.Mkdir(dbDir, 0755)
	}
	// Open the database
	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("%s/accounts.db", dbDir)), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	db.AutoMigrate(&obj.User{}, &obj.Session{})
	db.Exec("PRAGMA foreign_keys = ON;")
	DB = db
}
