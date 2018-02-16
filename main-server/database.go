package main

import (
	"database/sql"
	"fmt"
)

const (
	USER     = "test_user"
	PASSWORD = "password"
	DB_NAME  = "test_db"
)

type Database struct {
	*sql.DB
}

func SetUpDatabase() (*Database, error) {
	db, err := sql.Open("postgres", fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable", USER, PASSWORD, DB_NAME))
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(10)

	if err := createTables(db); err != nil {
		return nil, err
	}

	return &Database{DB: db}, nil
}

func createTables(db *sql.DB) error {
	return nil
}
