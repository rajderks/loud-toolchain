package main

import (
	"io/ioutil"
	"os"
	"regexp"
)

type Replace struct {
	Regexp string
	Replacer string
}
var replaces = []Replace{
	{
		Regexp: "[ \\t]+",
		Replacer: "",
	},
	{
		Regexp: "--.+\n",
		Replacer: "",
	},
	{
		Regexp: "([\\w]+)=",
		Replacer: "'$1'=",
	},
	{
		Regexp: `=.*['\(\}\{]+([-\d\w\/,.]+)['\)\}\{]+`,
		Replacer: "='$1'",
	},
	{
		Regexp: "GROUP{",
		Replacer: "{",
	},
	{
		Regexp: ",\r?\n\\}",
		Replacer: "\n}",
	},
	{
		Regexp: "'",
		Replacer: `"`,
	},
	{
		Regexp: "=",
		Replacer: ":",
	},
	{
		Regexp: `^"Scenario":`,
		Replacer: "var Scenario=",
	},
	{
		Regexp: `\[|\]`,
		Replacer: "",
	},
}

func main() {
	f, err := os.Open("test.lua")
	if err != nil {
		panic(err)
	}
	d, err := ioutil.ReadAll(f)
	if err != nil {
		panic(err)
	}
	for _, replace := range replaces {
		expr, err := regexp.Compile(replace.Regexp)
		if err != nil {
			panic(err)
		}
		d = expr.ReplaceAll(d, []byte(replace.Replacer))
	}

	f.Close()
	f, err = os.Create("test.js")
	f.Write(d)
}
