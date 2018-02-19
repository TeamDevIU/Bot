package main

// CreateRoom для парсинга запроса на создание комнаты
type CreateRoom struct {
	RoomName string   `json:"roomName"`
	UserInfo UserInfo `json:"ownerInfo"`
}

// Subscribe для парсинга запроса на подписывание
type Subscribe struct {
	RoomID   int      `json:"roomID"`
	UserInfo UserInfo `json:"userInfo"`
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
