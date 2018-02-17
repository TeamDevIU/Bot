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

func (db *Database) createUser(user *UserInfo) (int32, error) {
	rows, err := db.Query("SELECT id FROM users WHERE bot_id = $1 AND bot_type = $2",
		user.ID, user.BotType)
	if err != nil {
		return -1, err
	}

	var id int32
	id = -1
	for rows.Next() {
		rows.Scan(&id)
	}

	if id == -1 {
		row := db.QueryRow("INSERT INTO users (bot_id, name, bot_type) VALUES ($1, $2, $3) RETURNING id",
			user.ID, user.Name, user.BotType)
		if err := row.Scan(&id); err != nil {
			return -1, err
		}
	}
	return id, nil
}

func (db *Database) createRoom(room *CreateRoom) (int32, error) {
	adminID, err := db.createUser(&room.UserInfo)
	if err != nil {
		return -1, err
	}

	row := db.QueryRow("INSERT INTO rooms (name, admin_id) VALUES ($1, $2) RETURNING id",
		room.RoomName, adminID)
	var id int32
	if err := row.Scan(&id); err != nil {
		return -1, err
	}

	return id, nil
}

func (db *Database) getAdminRooms(adminID int, botType string) ([]RoomInfo, error) {
	result := []RoomInfo{}

	rows, err := db.Query("SELECT id, name FROM rooms WHERE admin_id = (SELECT id FROM users WHERE bot_id = $1 AND bot_type = $2)", adminID, botType)
	if err != nil {
		return nil, err
	}

	currInfo := RoomInfo{}
	for rows.Next() {
		rows.Scan(&currInfo.ID, &currInfo.Name)

		result = append(result, currInfo)
	}

	return result, nil
}
