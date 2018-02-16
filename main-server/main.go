package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

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
	fmt.Println(string(body), "\n", createRoom)

	w.Write([]byte("its all ok"))
}

// Получение списка комнат, доступных пользователю
// Выводит либо все группы, либо только те, которые можно удалять
func handleGetRooms(w http.ResponseWriter, r *http.Request) {
	// Получаем инфу о том, какой список надо вывести
	role := strings.Split(r.URL.Path, "/")[2]
	var res string

	// Ниже будут запросы в бд для комнат
	switch role {
	case "reader":
		res = "reader's rooms"
	case "moderator":
		res = "moderator's rooms"
	case "admin":
		res = "admin's rooms"
	default:
		res = "No rooms"
	}

	w.Write([]byte(res))
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/createRoom", handleCreateRoom).
		Methods("POST")
	r.HandleFunc("/rooms/{role}", handleGetRooms).
		Methods("GET")

	fmt.Println("starting server at :8080")
	log.Fatal(http.ListenAndServe(":8080", r))

}
