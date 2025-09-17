package logger

import (
	"os"
	"strings"

	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

func init() {
	Log = logrus.New()

	// Set log level based on environment
	env := strings.ToLower(os.Getenv("APP_ENV"))
	switch env {
	case "prod", "production":
		Log.SetLevel(logrus.InfoLevel)
		Log.SetFormatter(&logrus.JSONFormatter{})
	case "dev", "development":
		Log.SetLevel(logrus.DebugLevel)
		Log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
			ForceColors:   true,
		})
	default:
		Log.SetLevel(logrus.InfoLevel)
		Log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	// Set output to stdout
	Log.SetOutput(os.Stdout)
}

// Debug logs a debug message
func Debug(args ...interface{}) {
	Log.Debug(args...)
}

// Debugf logs a formatted debug message
func Debugf(format string, args ...interface{}) {
	Log.Debugf(format, args...)
}

// Info logs an info message
func Info(args ...interface{}) {
	Log.Info(args...)
}

// Infof logs a formatted info message
func Infof(format string, args ...interface{}) {
	Log.Infof(format, args...)
}

// Warn logs a warning message
func Warn(args ...interface{}) {
	Log.Warn(args...)
}

// Warnf logs a formatted warning message
func Warnf(format string, args ...interface{}) {
	Log.Warnf(format, args...)
}

// Error logs an error message
func Error(args ...interface{}) {
	Log.Error(args...)
}

// Errorf logs a formatted error message
func Errorf(format string, args ...interface{}) {
	Log.Errorf(format, args...)
}

// Fatal logs a fatal message and exits
func Fatal(args ...interface{}) {
	Log.Fatal(args...)
}

// Fatalf logs a formatted fatal message and exits
func Fatalf(format string, args ...interface{}) {
	Log.Fatalf(format, args...)
}

// WithField creates a new entry with a field
func WithField(key string, value interface{}) *logrus.Entry {
	return Log.WithField(key, value)
}

// WithFields creates a new entry with multiple fields
func WithFields(fields logrus.Fields) *logrus.Entry {
	return Log.WithFields(fields)
}

// WithError creates a new entry with an error
func WithError(err error) *logrus.Entry {
	return Log.WithError(err)
}
