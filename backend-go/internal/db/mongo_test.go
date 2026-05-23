package db

import "testing"

func TestDatabaseFromURI(t *testing.T) {
	cases := map[string]string{
		"mongodb+srv://u:p@host/statvio?retryWrites=true&w=majority": "statvio",
		"mongodb://host:27017/mydb":                                  "mydb",
		"mongodb+srv://u:p@host/?retryWrites=true":                   "test",
		"mongodb://host:27017":                                       "test",
		"mongodb+srv://u:p@cluster.mongodb.net/Statvio":              "Statvio",
	}
	for uri, want := range cases {
		if got := databaseFromURI(uri); got != want {
			t.Errorf("databaseFromURI(%q) = %q, want %q", uri, got, want)
		}
	}
}
