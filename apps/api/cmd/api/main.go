package main

import (
	"fmt"
	"log"
	"os"
	"github.com/example/restosaas/apps/api/internal/server"
)

func main() {
	app := server.New()
	server.Mount(app.R, app.DB)
	port := os.Getenv("PORT"); if port == "" { port = "8080" }
	log.Printf("API listening on :%s", port)
	if err := app.R.Run(fmt.Sprintf(":%s", port)); err != nil { log.Fatal(err) }
}
