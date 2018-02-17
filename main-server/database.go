package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
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
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id SERIAL NOT NULL PRIMARY KEY,
		bot_id INT NOT NULL,
		name VARCHAR(300) NOT NULL,
		bot_type VARCHAR(2) NOT NULL
	)`); err != nil {
		return err
	}

	if _, err := db.Exec(`DO '
		BEGIN
			IF NOT EXISTS (SELECT * FROM pg_type WHERE typname = ''role'') THEN
				CREATE TYPE role AS ENUM (''reader'', ''moderator'');
			END IF;
		END	
	'`); err != nil {
		return err
	}

	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS rooms (
		id SERIAL NOT NULL PRIMARY KEY,
		name VARCHAR(300) NOT NULL,
		admin_id INT NOT NULL REFERENCES users (id)
	)`); err != nil {
		return err
	}

	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS roles (
		id SERIAL NOT NULL PRIMARY KEY,
		room_id INT NOT NULL REFERENCES rooms (id),
		user_id INT NOT NULL REFERENCES users (id),
		user_role role NOT NULL DEFAULT reader
	)`); err != nil {
		return err
	}

	return nil
}
