import requests

url = "http://localhost:11434/api/generate"
data = {
    "model": "mistral",
    "prompt": "Explain quantum computing in simple terms.",
    "stream": False
}

try:
    response = requests.post(url, json=data, timeout=10)
    response.raise_for_status()  # Check for HTTP errors
    print(response.json()["response"])
except requests.exceptions.ConnectionError:
    print(f"Error: Could not connect to {url}. Verify server is running and port is correct.")
except requests.exceptions.Timeout:
    print(f"Error: Request timed out after {response.timeout} seconds. Server may be overloaded.")
except Exception as e:
    print(f"An error occurred: {str(e)}")
