package lib

import (
	"math/rand"

	"github.com/HazelnutParadise/Go-Utils/conv"
)

func GenerateVerifyCode(length uint) string {
	code := ""
	for range length {
		code += conv.ToString(rand.Intn(10))
	}
	return code
}
