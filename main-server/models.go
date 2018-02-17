package main

// CreateRoom для парсинга запроса на создание комнаты
type CreateRoom struct {
	RoomName string   `json:"roomName"`
	UserInfo UserInfo `json:"ownerInfo"`
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
