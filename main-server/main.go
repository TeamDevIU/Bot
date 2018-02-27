package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"

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
		resp := &CreateRoomResponse{
			ID:  -1,
			Err: err.Error(),
		}
		respBody, _ := json.Marshal(resp)

		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !checkStruct(createRoom) {
		resp := &CreateRoomResponse{
			ID:  -1,
			Err: "Bad request body, check api docs",
		}
		respBody, _ := json.Marshal(resp)

		w.WriteHeader(400)
		w.Write(respBody)
		return
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
		rooms, err = db.getReaderRooms(userID, botType)
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
			Err: "Bad request body, check api docs",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !checkStruct(subscribe) {
		resp := &ErrorResponse{
			Err: "Bad request body, check api docs",
		}
		respBody, _ := json.Marshal(resp)

		w.WriteHeader(400)
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

// Отправка сообщений
func handeSendMessage(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	sendMessage := new(SendMessage)
	err := json.Unmarshal(body, sendMessage)
	if err != nil {
		resp := &ErrorResponse{
			Err: "Bad request body, check api docs",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !checkStruct(sendMessage) {
		resp := &ErrorResponse{
			Err: "Bad request body, check api docs",
		}
		respBody, _ := json.Marshal(resp)

		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if db.checkRights(sendMessage.RoomID, sendMessage.SenderInfo.ID, sendMessage.SenderInfo.BotType) {
		// Отправка сообщений
		recipients, err := db.getMessageRecipient(sendMessage.RoomID)
		if err == nil {
			err = errors.New("none")
		}
		resp := &ErrorResponse{
			Err: err.Error(),
		}
		respBody, _ := json.Marshal(resp)
		w.Write(respBody)
		for i := range recipients {
			go func(j int) {
				recip := recipients[j]
				var ur string
				if recip.BotType == "vk" {
					ur = VKBotAdr
				} else {
					ur = TelegramBotAdr
				}
				req := `{
	"user_id":` + strconv.Itoa(recip.ID) + `,
	"message": "Сообщение от группы ` + strconv.Itoa(sendMessage.RoomID) + `: ` + sendMessage.Message + `"
}`
				res, err := http.Post(ur, "application/json", strings.NewReader(req))
				if err != nil {
					fmt.Println(err)
					return
				}
				defer res.Body.Close()
				resBody, _ := ioutil.ReadAll(res.Body)
				fmt.Println(string(resBody))
			}(i)
		}
	} else {
		resp := &ErrorResponse{
			Err: "You have no rights for sending message to this room",
		}
		respBody, _ := json.Marshal(resp)
		w.Write(respBody)
	}
}

func handleGetFullRoomInfo(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		resp := GetFullRoomInfoResponse{
			Err: err.Error(),
		}
		respBody, _ := json.Marshal(resp)
		w.Write(respBody)
		return
	}

	resp := db.getFullRoomInfo(roomID)
	respBody, _ := json.Marshal(resp)
	w.Write(respBody)
}

func ServeMainServer() (http.Handler, error) {
	var err error
	if db, err = SetUpDatabase(); err != nil {
		return nil, err
	}
	r := mux.NewRouter()

	r.HandleFunc("/createRoom", handleCreateRoom).
		Methods("POST")
	r.HandleFunc("/rooms", handleGetRooms).
		Methods("GET")
	r.HandleFunc("/subscribe", handeNewSubscribe).
		Methods("POST")
	r.HandleFunc("/sendMessage", handeSendMessage).
		Methods("POST")
	r.HandleFunc("/roomInfo", handleGetFullRoomInfo).
		Methods("GET")

	return r, nil
}

func main() {
	p := flag.Int("port", 8080, "setting port for serve")
	port := strconv.Itoa(*p)

	USER = *flag.String("db-user", "test_user", "setting database username")
	PASSWORD = *flag.String("db-pass", "password", "setting database password")
	DB_NAME = *flag.String("db-name", "test_db", "setting database name")
	TelegramBotAdr = *flag.String("tg-bot", "http://0df39e31.ngrok.io", "setting telegram bot adress")
	VKBotAdr = *flag.String("vk-bot", "http://c46d259b.ngrok.io/send_message", "setting vk bot adress")
	flag.Parse()

	r, err := ServeMainServer()
	if err != nil {
		panic(err)
	}
	fmt.Println("starting server at :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
