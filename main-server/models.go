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

// SendMessage для парсинга запроса на отправку сообщения
type SendMessage struct {
	RoomID     int      `json:"room_id"`
	Message    string   `json:"message"`
	SenderInfo UserInfo `json:"sender_info"`
}

// ErrorResponse хранит тело ответа с одной ошибкой
type ErrorResponse struct {
	Err string `json:"error"`
}

// UserInfo для парсинга инфы о пользователе
type UserInfo struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	BotType string `json:"type"`
}

// CreateRoomResponse хранит ответ на запрос создания комнаты
type CreateRoomResponse struct {
	ID  int32  `json:"room_id"`
	Err string `json:"error"`
}

// RoomInfo хранит минимальную информацию о комнате
type RoomInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// GetRoomsResponse хранит ответ на запрос списка комнат
type GetRoomsResponse struct {
	Rooms []RoomInfo `json:"rooms"`
	Err   string     `json:"error"`
}

// GetFullRoomInfoResponse хранит ответ на запрос полной информации комнаты
type GetFullRoomInfoResponse struct {
	RoomName   string     `json:"room_name"`
	Admin      UserInfo   `json:"admin"`
	Moderators []UserInfo `json:"moderators"`
	Readers    []UserInfo `json:"reader"`
	Err        string     `json:"error"`
}
