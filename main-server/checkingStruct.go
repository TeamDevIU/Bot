package main

import (
	"reflect"
)

// CheckStruct проверяет структуру in на корректное заполнение
// В структуре in должны храниться данные, пришедшие в теле запроса.
func CheckStruct(in interface{}) bool {
	val := reflect.ValueOf(in).Elem()

	for i := 0; i < val.NumField(); i++ {
		valueField := val.Field(i)
		typeField := val.Type().Field(i)
		switch typeField.Type.Kind() {
		case reflect.Int:
			if valueField.Int() <= 0 {
				return false
			}
		case reflect.String:
			if valueField.String() == "" {
				return false
			}
		case reflect.Slice:
			for j := 0; j < valueField.Len(); i++ {
				if !CheckStruct(valueField.Index(j).Addr().Interface()) {
					return false
				}
			}
		case reflect.Struct:
			if !CheckStruct(valueField.Addr().Interface()) {
				return false
			}
		default:
			return false
		}
	}
	return true
}
