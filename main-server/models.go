package main

// CreateRoom для парсинга запроса на создание комнаты
type CreateRoom struct {
	RoomName string   `json:"room_name"`
	UserInfo UserInfo `json:"owner_info"`
}

// Subscribe для парсинга запроса на подписывание
type Subscribe struct {
	RoomID   int      `json:"room_id"`
	UserInfo UserInfo `json:"user_info"`
}

type SendMessage struct {
	RoomID     int      `json:"room_id"`
	Message    string   `json:"message"`
	SenderInfo UserInfo `json:"sender_info"`
}

type ErrorResponse struct {
	Err string `json:"error"`
}

// UserInfo для парсинга инфы о пользователе
type UserInfo struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	BotType string `json:"type"`
}

type CreateRoomResponse struct {
	ID  int32  `json:"room_id"`
	Err string `json:"error"`
}

type RoomInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type GetRoomsResponse struct {
	Rooms []RoomInfo `json:"rooms"`
	Err   string     `json:"error"`
}
