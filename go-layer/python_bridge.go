package journal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type PythonProcessRequest struct {
	RawText     string  `json:"raw_text"`
	UserProfile *string `json:"user_profile"`
}

type PythonProcessResponse struct {
	Parsed      ParsedJournal `json:"parsed"`
	JournalText string        `json:"journal_text"`
}

// CallPythonProcessor sends the raw text to the Python API and returns the processed data
func CallPythonProcessor(ctx context.Context, rawText string, userProfile *string) (*PythonProcessResponse, error) {
	pythonURL := os.Getenv("PYTHON_SERVICE_URL")
	if pythonURL == "" {
		pythonURL = "http://localhost:8000"
	}
	internalKey := os.Getenv("PYTHON_INTERNAL_KEY")

	reqBody := PythonProcessRequest{
		RawText:     rawText,
		UserProfile: userProfile,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal python request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", pythonURL+"/process", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create python request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if internalKey != "" {
		req.Header.Set("X-Internal-Key", internalKey)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call python processor: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("python processor returned status %d", resp.StatusCode)
	}

	var processResp PythonProcessResponse
	if err := json.NewDecoder(resp.Body).Decode(&processResp); err != nil {
		return nil, fmt.Errorf("failed to decode python processor response: %w", err)
	}

	return &processResp, nil
}
