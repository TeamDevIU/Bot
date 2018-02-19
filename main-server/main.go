package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
)

var (
	TelegramBotAdr string
	VKBotAdr       string
	db             *Database
)

func initBotAdresses(w http.ResponseWriter, r *http.Request) {
	botType := r.URL.Path[1:]
	var res string
	switch botType {
	case "tg":
		TelegramBotAdr = r.RemoteAddr
		res = "Telegram bot registration success."
	case "vk":
		VKBotAdr = r.RemoteAddr
		res = "VK bot registration success."
	default:
		res = "Unknown bot type."
	}

	w.Write([]byte(res))
}

// Создание комнаты
func handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	createRoom := new(CreateRoom)
	err := json.Unmarshal(body, createRoom)
	if err != nil {
		fmt.Println(err)
	}

	// Получили инфу о новой комнате и "авторе комнаты"
	// Тут ее надо запихать в бд и вернуть id комнаты
	roomID, err := db.createRoom(createRoom)
	if err == nil {
		err = errors.New("none")
	}
	resp := &CreateRoomResponse{
		ID:  roomID,
		Err: err.Error(),
	}
	respBody, _ := json.Marshal(resp)
	w.Write(respBody)
}

// Получение списка комнат, доступных пользователю
// Выводит либо все группы, либо только те, которые можно удалять
func handleGetRooms(w http.ResponseWriter, r *http.Request) {
	// Получаем инфу о том, какой список надо вывести
	role := r.URL.Query().Get("role")
	userID, err := strconv.Atoi(r.URL.Query().Get("userID"))
	botType := r.URL.Query().Get("botType")
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}

	// Ниже будут запросы в бд для комнат
	var rooms []RoomInfo
	switch role {
	case "reader":
	case "moderator":
	case "admin":
		rooms, err = db.getAdminRooms(userID, botType)
	default:
	}

	if err == nil {
		err = errors.New("none")
	}
	resp := &GetRoomsResponse{
		Rooms: rooms,
		Err:   err.Error(),
	}
	respBody, _ := json.Marshal(resp)
	w.Write(respBody)
}

// Подписка юзера на комнату
func handeNewSubscribe(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	subscribe := new(Subscribe)
	err := json.Unmarshal(body, subscribe)
	if err != nil {
		resp := &ErrorResponse{
			Err: "Some troubles with request body",
		}
		respBody, _ := json.Marshal(resp)
		w.Write(respBody)
		return
	}

	err = db.subscribe(subscribe)
	if err == nil {
		err = errors.New("none")
	}

	resp := &ErrorResponse{
		Err: err.Error(),
	}
	respBody, _ := json.Marshal(resp)
	w.Write(respBody)
	return
}

func main() {
	var err error

	if db, err = SetUpDatabase(); err != nil {
		panic(err)
	}

	r := mux.NewRouter()

	port := os.Getenv("APPPORT")

	r.HandleFunc("/createRoom", handleCreateRoom).
		Methods("POST")
	r.HandleFunc("/rooms", handleGetRooms).
		Methods("GET")
	r.HandleFunc("/subscribe", handeNewSubscribe).
		Methods("POST")
	r.HandleFunc("/{bot-type}", initBotAdresses).
		Methods("GET")

	fmt.Println("starting server at :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
