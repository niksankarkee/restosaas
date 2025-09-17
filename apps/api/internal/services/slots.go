package services

import (
	"fmt"
	"time"

	"github.com/example/restosaas/apps/api/internal/db"
	"gorm.io/gorm"
)

type Slot struct {
	Start     time.Time
	End       time.Time
	Available int
}

// Generate 30-min slots within opening hours and subtract overlapping reservations.
func GenerateSlots(gdb *gorm.DB, restaurantID string, date time.Time) ([]Slot, error) {
	var r db.Restaurant
	if err := gdb.First(&r, "id = ?", restaurantID).Error; err != nil {
		return nil, err
	}
	weekday := int(date.Weekday())
	var oh db.OpeningHour
	if err := gdb.Where("restaurant_id = ? AND weekday = ?", restaurantID, weekday).First(&oh).Error; err != nil {
		return []Slot{}, nil // closed
	}
	parse := func(hm string) (int, int) { var H, M int; fmt.Sscanf(hm, "%d:%d", &H, &M); return H, M }
	H1, M1 := parse(oh.OpenTime)
	H2, M2 := parse(oh.CloseTime)
	loc, _ := time.LoadLocation(r.Timezone)
	start := time.Date(date.Year(), date.Month(), date.Day(), H1, M1, 0, 0, loc)
	end := time.Date(date.Year(), date.Month(), date.Day(), H2, M2, 0, 0, loc)
	var out []Slot
	for t := start; t.Add(30*time.Minute).Before(end) || t.Add(30*time.Minute).Equal(end); t = t.Add(30 * time.Minute) {
		// sum overlapping reservations for 90-min duration default
		var used int64
		q := gdb.Model(&db.Reservation{}).
			Where("restaurant_id = ? AND status IN ? AND starts_at < ? AND (starts_at + (duration_min || ' minutes')::interval) > ?",
				restaurantID, []db.ReservationStatus{db.ResvPending, db.ResvConfirmed}, t.Add(90*time.Minute), t)
		q.Select("COALESCE(SUM(party_size),0)").Scan(&used)
		avail := int(r.Capacity) - int(used)
		if avail < 0 {
			avail = 0
		}
		out = append(out, Slot{Start: t, End: t.Add(30 * time.Minute), Available: avail})
	}
	return out, nil
}
