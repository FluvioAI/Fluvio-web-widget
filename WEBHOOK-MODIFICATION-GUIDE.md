# Make.com Webhook Setup Guide

This guide explains how to configure your Make.com webhook to support both voice calls and text chat from the Fluvio widget.

---

## Overview

The widget sends all requests to a single webhook URL. Make.com then reads the request, decides whether it is a voice call or a chat message, routes it to the correct Retell AI endpoint, and returns the response.

### Request Flow

```
Website visitor clicks widget
        |
        v
Fluvio Widget sends request to Make.com webhook
        |
        v
Make.com Router checks: voice or chat?
        |
   _____|_____
  |           |
  v           v
Voice       Chat
Retell      Retell
API         API
  |           |
  v           v
Response returned to widget
```

---

## What the Widget Sends

Depending on the visitor's action, the widget sends one of the following request formats to your webhook.

### Voice Call Request

```json
{
  "project_id": "YOUR-PROJECT-ID",
  "mode": "voice",
  "dynamic_variables": {
    "company_name": "Acme Corp"
  }
}
```

### Chat — Start a New Session

```json
{
  "project_id": "YOUR-PROJECT-ID",
  "mode": "chat",
  "action": "create_session"
}
```

### Chat — Send a Message

```json
{
  "project_id": "YOUR-PROJECT-ID",
  "mode": "chat",
  "action": "send_message",
  "chat_id": "chat_abc123",
  "message": "Hello, I have a question."
}
```

---

## Make.com Configuration

### Step 1: Add a Router Module

In your Make.com scenario, add a **Router** module immediately after the Webhook trigger. The router will direct each request to the correct path based on what the widget sent.

Create three routes:

| Route | Condition |
|-------|-----------|
| Voice | `mode` equals `voice` |
| Chat — New Session | `mode` equals `chat` AND `action` equals `create_session` |
| Chat — Message | `mode` equals `chat` AND `action` equals `send_message` |

### Step 2: Set Route Filters

In Make.com, set each route's filter condition as follows.

**Voice Route:**
```
{{1.mode}} = voice
```

**Chat — New Session Route:**
```
{{1.mode}} = chat
{{1.action}} = create_session
```

**Chat — Message Route:**
```
{{1.mode}} = chat
{{1.action}} = send_message
```

---

## Step 3: Configure the API Calls

Each route needs an HTTP module that calls the Retell AI API.

### Voice Route — Create Web Call

| Setting | Value |
|---------|-------|
| URL | `https://api.retellai.com/v2/create-web-call` |
| Method | POST |
| Authorization Header | `Bearer YOUR_RETELL_API_KEY` |
| Content-Type Header | `application/json` |

Request body:
```json
{
  "agent_id": "YOUR_VOICE_AGENT_ID",
  "retell_llm_dynamic_variables": {{1.dynamic_variables}}
}
```

### Chat Route — Create Session

| Setting | Value |
|---------|-------|
| URL | `https://api.retellai.com/create-chat` |
| Method | POST |
| Authorization Header | `Bearer YOUR_RETELL_API_KEY` |
| Content-Type Header | `application/json` |

Request body:
```json
{
  "agent_id": "YOUR_CHAT_AGENT_ID",
  "retell_llm_dynamic_variables": {{1.dynamic_variables}}
}
```

### Chat Route — Send Message

| Setting | Value |
|---------|-------|
| URL | `https://api.retellai.com/create-chat-completion` |
| Method | POST |
| Authorization Header | `Bearer YOUR_RETELL_API_KEY` |
| Content-Type Header | `application/json` |

Request body:
```json
{
  "chat_id": "{{1.chat_id}}",
  "content": "{{1.message}}"
}
```

---

## Step 4: Format the Responses

Each route must return a response to the widget in the correct format. Add a **Webhook Response** module at the end of each route.

### Voice Response

```json
{
  "access_token": "{{retell_response.access_token}}"
}
```

### Chat — New Session Response

```json
{
  "chat_id": "{{retell_response.chat_id}}",
  "mode": "chat",
  "action": "session_created"
}
```

### Chat — Message Response

```json
{
  "messages": {{retell_response.messages}},
  "mode": "chat",
  "action": "message_sent"
}
```

---

## Testing the Webhook

Once configured, use the test page at `index.html` to send test requests. You can also use the tests below to verify each route independently.

### Test Voice (requires a terminal or API tool)

```bash
curl -X POST "https://hook.us2.make.com/your-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR-PROJECT-ID",
    "mode": "voice"
  }'
```

### Test Chat — New Session

```bash
curl -X POST "https://hook.us2.make.com/your-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR-PROJECT-ID",
    "mode": "chat",
    "action": "create_session"
  }'
```

### Test Chat — Send Message

```bash
curl -X POST "https://hook.us2.make.com/your-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR-PROJECT-ID",
    "mode": "chat",
    "action": "send_message",
    "chat_id": "chat_id_from_previous_response",
    "message": "Hello!"
  }'
```

---

## Retell Dashboard Requirements

Before testing, confirm the following in your Retell dashboard:

- A voice agent has been created and its agent ID is noted
- A chat agent has been created and its agent ID is noted (this can be the same agent as voice)
- Your API key has permissions for: web call creation, chat creation, and chat completion

---

## Security Notes

- Your Retell API key is stored securely inside Make.com and is never sent to or exposed in the widget
- All API calls to Retell are made server-side through your webhook
- The widget itself never communicates directly with Retell
