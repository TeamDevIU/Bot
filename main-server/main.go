package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

var (
	// TelegramBotAdr хранит адресс, по которому необходимо отправлять сообщения telegram боту
	TelegramBotAdr string
	// VKBotAdr хранит адресс, по которому необходимо отправлять сообщения telegram боту
	VKBotAdr string
	db       *Database
	// Logger выполняет логирование сервера
	Logger *log.Logger
)

// HandleCreateRoom отвечает за обработку запроса на создание комнаты
func HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	Logger.Print("handle create-room request from " + r.RemoteAddr)
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	createRoom := new(CreateRoom)
	err := json.Unmarshal(body, createRoom)
	if err != nil {
		Logger.Print("error while parsing request body: " + err.Error())
		resp := &CreateRoomResponse{
			ID:  -1,
			Err: "Bad values in request body",
		}
		respBody, _ := json.Marshal(resp)

		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !CheckStruct(createRoom) {
		Logger.Print("incomplete request body")
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

// HandleGetRooms отвечает за обработку запроса на получение
// списка комнат, доступных пользователю.
// Выводит либо все группы, либо только те, которые можно удалять
func HandleGetRooms(w http.ResponseWriter, r *http.Request) {
	Logger.Print("handle get-rooms request from " + r.RemoteAddr)
	// Получаем инфу о том, какой список надо вывести
	role := r.URL.Query().Get("role")
	userID, err := strconv.Atoi(r.URL.Query().Get("userID"))
	botType := r.URL.Query().Get("botType")
	if err != nil {
		Logger.Print("error while parsing get-room query: " + err.Error())
		w.WriteHeader(400)
		resp := &GetRoomsResponse{
			Rooms: nil,
			Err:   "Bad values in request query",
		}
		respBody, _ := json.Marshal(resp)
		w.Write(respBody)
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

// HandeNewSubscribe обрабатывает запрос на подписку юзера на комнату
func HandeNewSubscribe(w http.ResponseWriter, r *http.Request) {
	Logger.Print("handle new-subscribe request from " + r.RemoteAddr)
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	subscribe := new(Subscribe)
	err := json.Unmarshal(body, subscribe)
	if err != nil {
		Logger.Print("error while parsing request body: " + err.Error())
		resp := &ErrorResponse{
			Err: "Bad values in request body",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !CheckStruct(subscribe) {
		Logger.Print("incomplete request body")
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

// HandeSendMessage обрабатывает запрос на оправку сообщений
func HandeSendMessage(w http.ResponseWriter, r *http.Request) {
	Logger.Print("handle send-message request from " + r.RemoteAddr)
	body, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	sendMessage := new(SendMessage)
	err := json.Unmarshal(body, sendMessage)
	if err != nil {
		Logger.Print("error while parsing request body: " + err.Error())
		resp := &ErrorResponse{
			Err: "Bad values in request body",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	if !CheckStruct(sendMessage) {
		Logger.Print("incomplete request body")
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
					Logger.Print("error while sending message to", ur, "with id ", recip.ID, recip.BotType, ": "+err.Error())
					return
				}
				defer res.Body.Close()
				resBody, _ := ioutil.ReadAll(res.Body)
				Logger.Print("Response from ", ur, "(id=", recip.ID, recip.BotType, "): ", string(resBody))
			}(i)
		}
	} else {
		Logger.Print("user has no rights to sending message")
		resp := &ErrorResponse{
			Err: "You have no rights for sending message to this room",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
	}
}

func handleGetFullRoomInfo(w http.ResponseWriter, r *http.Request) {
	Logger.Print("handle get-full-room-info request from " + r.RemoteAddr)
	roomID, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		Logger.Print("error while parsing get-full-room-info query: " + err.Error())
		resp := GetFullRoomInfoResponse{
			Err: "Bad values in request query",
		}
		respBody, _ := json.Marshal(resp)
		w.WriteHeader(400)
		w.Write(respBody)
		return
	}

	resp := db.getFullRoomInfo(roomID)
	respBody, _ := json.Marshal(resp)
	w.Write(respBody)
}

// ServeMainServer подготавливает сервер к запуску.
// Настраивается подключение к базе данных, по необходимости создаются таблицы
// Устанавливаются функции на обработку запросов.
func ServeMainServer() (http.Handler, error) {
	var err error
	if db, err = SetUpDatabase(); err != nil {
		return nil, err
	}
	r := mux.NewRouter()

	r.HandleFunc("/createRoom", HandleCreateRoom).
		Methods("POST")
	r.HandleFunc("/rooms", HandleGetRooms).
		Methods("GET")
	r.HandleFunc("/subscribe", HandeNewSubscribe).
		Methods("POST")
	r.HandleFunc("/sendMessage", HandeSendMessage).
		Methods("POST")
	r.HandleFunc("/roomInfo", handleGetFullRoomInfo).
		Methods("GET")

	return r, nil
}

func main() {
	f, err := os.OpenFile("MainServer.log", os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0755)
	if err != nil {
		log.Fatal(err)
	}
	Logger = log.New(f, "MainServer: ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Llongfile)
	Logger.Print("== Main Server Started ==")

	p := flag.Int("port", 8080, "setting port for serve")
	port := strconv.Itoa(*p)

	user := flag.String("dbuser", "test_user", "setting database username")
	password := flag.String("dbpass", "password", "setting database password")
	dbName := flag.String("dbname", "test_db", "setting database name")
	telegramBotAdr := flag.String("tgbot", "http://0df39e31.ngrok.io", "setting telegram bot adress")
	vkBotAdr := flag.String("vkbot", "http://c46d259b.ngrok.io/send_message", "setting vk bot adress")
	dbHost := flag.String("dbhost", "0.0.0.0", "Database adress")
	dbPort := flag.String("dbport", "5432", "Database port")
	flag.Parse()

	User = *user
	Password = *password
	DbName = *dbName
	DbAdress = *dbHost
	DbPort = *dbPort
	TelegramBotAdr = *telegramBotAdr
	VKBotAdr = *vkBotAdr

	r, err := ServeMainServer()
	if err != nil {
		panic(err)
	}
	fmt.Println("starting server at :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
