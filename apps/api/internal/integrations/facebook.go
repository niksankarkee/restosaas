package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type TextMsg struct { Recipient struct{ ID string `json:"id"` } `json:"recipient"`; Message struct{ Text string `json:"text"` } `json:"message"` }

func SendFBText(recipientID, text string) error {
	msg := TextMsg{}; msg.Recipient.ID = recipientID; msg.Message.Text = text
	b, _ := json.Marshal(msg)
	url := fmt.Sprintf("https://graph.facebook.com/v19.0/me/messages?access_token=%s", os.Getenv("FB_PAGE_ACCESS_TOKEN"))
	req, _ := http.NewRequest("POST", url, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req); if err != nil { return err }
	defer resp.Body.Close()
	if resp.StatusCode >= 300 { return fmt.Errorf("fb send status %d", resp.StatusCode) }
	return nil
}
