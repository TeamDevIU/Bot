package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"
)

func init() {
	USER = "test_user"
	PASSWORD = "password"
	DB_NAME = "db_for_test"
	DB_ADRESS = "0.0.0.0"
	DB_PORT = "5432"
	var buf bytes.Buffer
	Logger = log.New(&buf, "logger: ", log.Lshortfile)
}

// CaseResponse
type CR map[string]interface{}

type Case struct {
	Method string // GET по-умолчанию в http.NewRequest если передали пустую строку
	Path   string
	Query  string
	Status int
	Result interface{}
	Body   interface{}
}

var (
	client = &http.Client{Timeout: time.Second}
)

func TestAPI(t *testing.T) {
	handler, err := ServeMainServer()
	if err != nil {
		panic(err)
	}

	ts := httptest.NewServer(handler)

	cases := []Case{
		// ========================= Создание комнаты =========================
		// Нормальное создание
		Case{
			Path:   "/createRoom",
			Method: http.MethodPost,
			Body: CR{
				"room_name": "test room name",
				"owner_info": CR{
					"id":   1337,
					"name": "Test Name",
					"type": "tg",
				},
			},
			Result: CR{
				"room_id": 1,
				"error":   "none",
			},
		},
		// Неправильное тело на создание
		Case{
			Path:   "/createRoom",
			Method: http.MethodPost,
			Body: CR{
				"room_name": "test room name",
				"user_info": CR{
					"id":   1337,
					"name": "Test Name",
					"type": "tg",
				},
			},
			Result: CR{
				"room_id": -1,
				"error":   "Bad request body, check api docs",
			},
			Status: 400,
		},
		// Неправильное тело для парсинга
		Case{
			Path:   "/createRoom",
			Method: http.MethodPost,
			Body: CR{
				"room_name": "test room name",
				"owner_info": CR{
					"id":   "1337",
					"name": "Test Name",
					"type": "tg",
				},
			},
			Result: CR{
				"room_id": -1,
				"error":   "json: cannot unmarshal string into Go struct field UserInfo.id of type int",
			},
			Status: 400,
		},
		// ========================= Подписка на комнату нового юзера =========================
		// Нормальный запрос
		Case{
			Path:   "/subscribe",
			Method: http.MethodPost,
			Body: CR{
				"room_id": 1,
				"user_info": CR{
					"id":   100500,
					"name": "Test Subscriber",
					"type": "vk",
				},
			},
			Result: CR{
				"error": "none",
			},
		},
		// Неполное тело запроса
		Case{
			Path:   "/subscribe",
			Method: http.MethodPost,
			Body: CR{
				"room_id": 1,
				"info": CR{
					"id":   100500,
					"name": "Test Subscriber",
					"type": "vk",
				},
			},
			Result: CR{
				"error": "Bad request body, check api docs",
			},
			Status: 400,
		},
		// Неправильно заполненное тело
		Case{
			Path:   "/subscribe",
			Method: http.MethodPost,
			Body: CR{
				"room_id": 1,
				"user_info": CR{
					"id":   "100500",
					"name": "Test Subscriber",
					"type": "vk",
				},
			},
			Result: CR{
				"error": "json: cannot unmarshal string into Go struct field UserInfo.id of type int",
			},
			Status: 400,
		},
		// ========================= Получение списка комнат =========================
		// Получение списка администрируемых комнат
		Case{
			Path:  "/rooms",
			Query: "role=admin&userID=1337&botType=tg",
			Result: CR{
				"rooms": []CR{
					CR{
						"id":   1,
						"name": "test room name",
					},
				},
				"error": "none",
			},
		},
	}

	for idx, item := range cases {
		var (
			err      error
			result   interface{}
			expected interface{}
			req      *http.Request
		)

		caseName := fmt.Sprintf("case %d: [%s] %s %s", idx, item.Method, item.Path, item.Query)

		if item.Method == "" || item.Method == http.MethodGet {
			req, err = http.NewRequest(item.Method, ts.URL+item.Path+"?"+item.Query, nil)
		} else {
			data, err := json.Marshal(item.Body)
			if err != nil {
				panic(err)
			}
			reqBody := bytes.NewReader(data)
			req, err = http.NewRequest(item.Method, ts.URL+item.Path, reqBody)
			req.Header.Add("Content-Type", "application/json")
		}

		resp, err := client.Do(req)
		if err != nil {
			t.Errorf("[%s] request error: %v", caseName, err)
			continue
		}
		defer resp.Body.Close()
		body, err := ioutil.ReadAll(resp.Body)

		// fmt.Printf("[%s] body: %s\n", caseName, string(body))
		if item.Status == 0 {
			item.Status = http.StatusOK
		}

		if resp.StatusCode != item.Status {
			t.Errorf("[%s] expected http status %v, got %v", caseName, item.Status, resp.StatusCode)
			continue
		}

		err = json.Unmarshal(body, &result)
		if err != nil {
			t.Errorf("[%s] cant unpack json: %v", caseName, err)
			continue
		}

		// reflect.DeepEqual не работает если нам приходят разные типы
		// а там приходят разные типы (string VS interface{}) по сравнению с тем что в ожидаемом результате
		// этот маленький грязный хак конвертит данные сначала в json, а потом обратно в interface - получаем совместимые результаты
		// не используйте это в продакшен-коде - надо явно писать что ожидается интерфейс или использовать другой подход с точным форматом ответа
		data, err := json.Marshal(item.Result)
		json.Unmarshal(data, &expected)

		if !reflect.DeepEqual(result, expected) {
			t.Errorf("[%d] results not match\nGot : %#v\nWant: %#v", idx, result, expected)
			continue
		}
	}
}
