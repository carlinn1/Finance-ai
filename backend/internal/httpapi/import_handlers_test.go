package httpapi

import (
	"strings"
	"testing"
)

func TestParseCSV(t *testing.T) {
	input := "Data,Descrição,Valor\n19/06/2026,Salário,8500.00\n20/06/2026,Mercado,\"-234,50\"\n"
	items, err := parseCSV(strings.NewReader(input), "user", "account")
	if err != nil {
		t.Fatalf("parseCSV: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("len(items) = %d", len(items))
	}
	if items[0].Type != "income" || items[0].Amount != 8500 {
		t.Fatalf("receita inesperada: %#v", items[0])
	}
	if items[1].Type != "expense" || items[1].Amount != 234.5 {
		t.Fatalf("despesa inesperada: %#v", items[1])
	}
	if items[0].Fingerprint == items[1].Fingerprint {
		t.Fatal("fingerprints repetidos")
	}
}

func TestParseCSVRequiresColumns(t *testing.T) {
	_, err := parseCSV(strings.NewReader("foo,bar\n1,2\n"), "user", "account")
	if err == nil {
		t.Fatal("CSV sem colunas obrigatorias foi aceito")
	}
}
