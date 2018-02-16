package main

// CreateRoom для парсинга запроса на создание комнаты
type CreateRoom struct {
	RoomName string           `json:"roomName"`
	UserInfo TelegramUserInfo `json:"ownerInfo"`
}

// TelegramUserInfo для парсинга инфы о пользователе
type TelegramUserInfo struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	BotType string `json:"type"`
}
