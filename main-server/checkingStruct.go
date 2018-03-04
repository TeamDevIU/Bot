package main

import (
	"reflect"
)

func checkStruct(in interface{}) bool {
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
				if !checkStruct(valueField.Index(j).Addr().Interface()) {
					return false
				}
			}
		case reflect.Struct:
			if !checkStruct(valueField.Addr().Interface()) {
				return false
			}
		default:
			return false
		}
	}
	return true
}
