package main

import (
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/lib/pq"
)

var (
	USER     string
	PASSWORD string
	DB_NAME  string
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
		user_role role NOT NULL DEFAULT 'reader'
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

func (db *Database) subscribe(sub *Subscribe) error {
	userID, err := db.createUser(&sub.UserInfo)
	if err != nil {
		return err
	}

	// Проверка не является ли юзер админом выбранной комнаты
	rows, err := db.Query("SELECT id FROM rooms WHERE admin_id = $1", userID)
	if err != nil {
		return err
	}
	var id int
	id = -1
	for rows.Next() {
		rows.Scan(&id)
		if id == sub.RoomID {
			return errors.New("You are admin of this room")
		}
	}

	// Проверка не подписан ли уже на эту комнату
	rows, err = db.Query("SELECT id FROM roles WHERE room_id = $1 AND user_id = $2",
		sub.RoomID, userID)
	if err != nil {
		return err
	}
	id = -1
	for rows.Next() {
		rows.Scan(&id)
		if id != -1 {
			return errors.New("You already subscribed on this room")
		}
	}

	row := db.QueryRow("INSERT INTO roles (room_id, user_id) VALUES ($1, $2) RETURNING id",
		sub.RoomID, userID)

	err = row.Scan(&id)
	return err
}

func (db *Database) getReaderRooms(readerID int, botType string) ([]RoomInfo, error) {
	result := []RoomInfo{}

	rows, err := db.Query("SELECT rooms.id, name FROM "+
		"(rooms JOIN roles ON rooms.id = roles.room_id) "+
		"WHERE user_id = (SELECT id FROM users WHERE bot_id = $1 AND bot_type = $2)", readerID, botType)
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

func (db *Database) checkRights(roomID, senderID int, botType string) bool {
	// Является ли админом
	rows, err := db.Query("SELECT id FROM rooms WHERE admin_id = (SELECT id FROM users WHERE bot_id = $1 AND bot_type = $2)", senderID, botType)
	if err != nil {
		fmt.Println(err.Error())
		return false
	}

	var id int
	for rows.Next() {
		rows.Scan(&id)
		if id == roomID {
			return true
		}
	}

	// Является ли модератором
	rows, err = db.Query("SELECT room_id FROM roles WHERE user_id = (SELECT id FROM users WHERE bot_id = $1 AND bot_type = $2) AND user_role = 'moderator'", senderID, botType)
	if err != nil {
		fmt.Println(err.Error())
		return false
	}
	id = -1
	for rows.Next() {
		rows.Scan(&id)

		fmt.Println(id)
		if id == roomID {
			return true
		}
	}
	return false
}

func (db *Database) getFullRoomInfo(roomID int) GetFullRoomInfoResponse {
	rows, err := db.Query("SELECT name FROM rooms WHERE id = $1", roomID)
	if err != nil {
		return GetFullRoomInfoResponse{Err: err.Error()}
	}
	var res GetFullRoomInfoResponse
	for rows.Next() {
		rows.Scan(&res.RoomName)
	}

	rows, err = db.Query("SELECT bot_id, name, bot_type FROM users WHERE id = (SELECT admin_id FROM rooms WHERE id = $1)", roomID)
	if err != nil {
		return GetFullRoomInfoResponse{Err: err.Error()}
	}
	for rows.Next() {
		rows.Scan(&res.Admin.ID, &res.Admin.Name, &res.Admin.BotType)
	}

	rows, err = db.Query("SELECT bot_id, name, bot_type FROM (users JOIN roles ON users.id = roles.user_id) WHERE user_role = 'moderator' AND room_id = $1", roomID)
	if err != nil {
		return GetFullRoomInfoResponse{Err: err.Error()}
	}
	var cur UserInfo
	for rows.Next() {
		rows.Scan(&cur.ID, &cur.Name, &cur.BotType)
		res.Moderators = append(res.Moderators, cur)
	}

	rows, err = db.Query("SELECT bot_id, name, bot_type FROM (users JOIN roles ON users.id = roles.user_id) WHERE user_role = 'reader' AND room_id = $1", roomID)
	if err != nil {
		return GetFullRoomInfoResponse{Err: err.Error()}
	}
	for rows.Next() {
		rows.Scan(&cur.ID, &cur.Name, &cur.BotType)
		res.Readers = append(res.Readers, cur)
	}

	res.Err = "none"

	return res
}

func (db *Database) getMessageRecipient(roomID int) ([]UserInfo, error) {
	res := []UserInfo{}

	rows, err := db.Query("SELECT bot_id, name, bot_type FROM (users JOIN roles ON users.id = roles.user_id) WHERE room_id = $1", roomID)
	if err != nil {
		return nil, err
	}
	var cur UserInfo
	for rows.Next() {
		rows.Scan(&cur.ID, &cur.Name, &cur.BotType)
		res = append(res, cur)
	}

	return res, nil
}
