package security

import (
	"testing"
	"time"
)

func TestPasswordHash(t *testing.T) {
	hash, err := HashPassword("Senha@123")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}
	if hash == "Senha@123" {
		t.Fatal("a senha foi armazenada sem hash")
	}
	if !CheckPassword(hash, "Senha@123") {
		t.Fatal("senha valida foi rejeitada")
	}
	if CheckPassword(hash, "Outra@123") {
		t.Fatal("senha invalida foi aceita")
	}
}

func TestAccessTokenRoundTrip(t *testing.T) {
	secret := "segredo-de-teste-com-mais-de-32-caracteres"
	token, _, err := CreateAccessToken("user-123", secret, time.Minute)
	if err != nil {
		t.Fatalf("CreateAccessToken: %v", err)
	}
	userID, err := ParseAccessToken(token, secret)
	if err != nil {
		t.Fatalf("ParseAccessToken: %v", err)
	}
	if userID != "user-123" {
		t.Fatalf("user id = %q", userID)
	}
	if _, err := ParseAccessToken(token, "outro-segredo-com-mais-de-32-caracteres"); err == nil {
		t.Fatal("token com assinatura incorreta foi aceito")
	}
}

func TestRefreshTokensAreRandomAndHashed(t *testing.T) {
	plainA, hashA, err := RandomToken()
	if err != nil {
		t.Fatalf("RandomToken: %v", err)
	}
	plainB, hashB, err := RandomToken()
	if err != nil {
		t.Fatalf("RandomToken: %v", err)
	}
	if plainA == hashA {
		t.Fatal("token foi persistido em texto puro")
	}
	if plainA == plainB || hashA == hashB {
		t.Fatal("tokens aleatorios repetidos")
	}
	if HashToken(plainA) != hashA {
		t.Fatal("hash do token nao e deterministico")
	}
}
