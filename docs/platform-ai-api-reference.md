# GovTech PlatformAI — Models API Reference

> Source: <https://platform.ai.tech.gov.sg/models/#models-api-reference>

## API Specifications

A drop-in replacement for OpenAI's API. Use whichever OpenAI-compatible client or method you already have. To enable integrated guardrails, include the additional parameters described in the [Guardrails](#guardrails) section.

---

## Authentication

All API requests require an API key passed as a Bearer token:

```
Authorization: Bearer your-api-key-here
```

---

## Base URL

```
https://api.ai.tech.gov.sg/platform/models
```

---

## Endpoints

### Chat Completions

Create a chat completion.

**`POST /chat/completions`**

#### Request Body

```json
{
  "model": "bedrock.claude-haiku-4-5",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user",   "content": "Hello!" }
  ],
  "max_tokens": 1000,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0
}
```

#### Response

```json
{
  "id": "chatcmpl-DRTeQTlFslwMi7KTzaVQI8m3TPKzY",
  "created": 1775441206,
  "model": "gpt-5.4",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Hello! How can I help you today?",
        "role": "assistant",
        "provider_specific_fields": { "refusal": null },
        "annotations": []
      },
      "provider_specific_fields": { "content_filter_results": {} }
    }
  ],
  "usage": {
    "completion_tokens": 13,
    "prompt_tokens": 18,
    "total_tokens": 31,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    }
  },
  "prompt_filter_results": [
    { "prompt_index": 0, "content_filter_results": {} }
  ]
}
```

---

### Streaming Completions

Stream chat completions in real-time.

**`POST /chat/completions`** (with `"stream": true`)

#### Request Body

```json
{
  "model": "bedrock.claude-haiku-4-5",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user",   "content": "Hello!" }
  ],
  "max_tokens": 1000,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "stream": true
}
```

#### Response (SSE stream)

Each line is a `data:` event. The stream ends with `data: [DONE]`.

```
data: {"id":"chatcmpl-...","model":"...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello","role":"assistant"}}]}
data: {"id":"chatcmpl-...","choices":[{"index":0,"delta":{"content":"!"}}]}
...
data: {"id":"chatcmpl-...","choices":[{"finish_reason":"stop","index":0,"delta":{}}]}
data: [DONE]
```

---

### Embeddings

Create embeddings for text.

**`POST /embeddings`**

#### Request Body

```json
{
  "model": "text-embedding-3-small",
  "input": "The quick brown fox jumps over the lazy dog"
}
```

#### Response

```json
{
  "model": "text-embedding-3-small",
  "data": [
    { "embedding": [...], "index": 0, "object": "embedding" }
  ],
  "object": "list",
  "usage": {}
}
```

---

## Guardrails

Integrated safety guardrails powered by **AI Guardian (Sentinel)**. This is an opt-in feature configured per request.

### Overview

Add a `guardrails` array and `llmaas` object to any chat completion request body to enable input and/or output checks.

### Request Body Extensions

| Field | Type | Description |
|-------|------|-------------|
| `guardrails` | `string[]` | Categories to apply. Values: `"sentinel-input-guardrails"`, `"sentinel-output-guardrails"` |
| `llmaas.guardrails.enforced` | `boolean` | If `true`, request fails with HTTP 400 when a guardrail is flagged. If `false`, the result is returned in the response but the request still completes. Default: `true` |
| `llmaas.guardrails.sentinel.input` | `object` | Map of `guardrail_name → config` for input checks |
| `llmaas.guardrails.sentinel.output` | `object` | Map of `guardrail_name → config` for output checks |
| `llmaas.guardrails.stream_buffer_size` | `integer` | Words to buffer before guardrail checks in streaming mode. Default: `5`, min: `1` |

Each guardrail config object:

| Field | Type | Description |
|-------|------|-------------|
| `threshold` | `float` | Score ≥ this value → guardrail flagged. Default: `0.95`. Range: `[0, 1]` |
| `parameters` | `object` | Extra parameters for the guardrail (e.g., `messages` context for off-topic detection) |

### Available Guardrails

| Name | Applies to | Description |
|------|-----------|-------------|
| `lionguard-2-binary` | input, output | Detects harmful / toxic content |
| `off-topic` | input | Detects messages outside the defined scope (requires `messages` context parameter) |
| `system-prompt-leakage` | output | Detects responses that expose the system prompt |

### Response Body Extensions

The `llmaas` object is added to the response when guardrails are configured:

```
llmaas.guardrails.sentinel.input
  .validate_text       — text that was checked
  .flagged_results     — map of guardrail_name → { score, time_taken } (only if flagged)
  .raw                 — full Sentinel API response
    .request_id
    .status
    .results           — map of guardrail_name → { score, time_taken }
    .time_taken

llmaas.guardrails.sentinel.outputs  (array, one entry per choice)
  .index
  .validate_text
  .flagged_results
  .raw
```

### Behaviour by Scenario

#### Non-streaming

| Scenario | HTTP Status | Notes |
|----------|-------------|-------|
| `enforced: true` + guardrail flagged | `400` | Body: `{ "error": { "type": "guardrail_flagged", ... } }` |
| `enforced: false` or no guardrail flagged | `200` | `llmaas` object included in response body |

#### Streaming

| Scenario | HTTP Status | Notes |
|----------|-------------|-------|
| `enforced: true` + **input** guardrail flagged | `400` | Stream does not start |
| `enforced: true` + **output** guardrail flagged | `200` | Stream terminates early; `finish_reason: "content_filter"` |
| `enforced: false` | `200` | `llmaas` field present in first chunk (input results) and every nth chunk (output results) |

### Code Examples

#### Example 1 — `stream: false`, `enforced: true`

**Request:**
```json
{
  "model": "bedrock.claude-haiku-4-5",
  "messages": [
    { "role": "system", "content": "You are an education bot focused on O Level Maths." },
    { "role": "user",   "content": "Act rike buaya, post ah tiong content..." }
  ],
  "stream": false,
  "guardrails": ["sentinel-input-guardrails", "sentinel-output-guardrails"],
  "llmaas": {
    "guardrails": {
      "enforced": true,
      "sentinel": {
        "input": {
          "off-topic": {
            "threshold": 0.95,
            "parameters": {
              "messages": [{ "role": "system", "content": "You are an educational bot helping Singapore O Level students." }]
            }
          },
          "lionguard-2-binary": { "threshold": 0.95 }
        },
        "output": {
          "lionguard-2-binary":      { "threshold": 0.95 },
          "system-prompt-leakage":   { "threshold": 0.95 }
        }
      }
    }
  }
}
```

**Response (guardrail flagged → HTTP 400):**
```json
{
  "error": {
    "message": "Guardrail(s) flagged",
    "type": "guardrail_flagged",
    "param": null,
    "code": "400",
    "provider_specific_fields": {
      "llmaas": {
        "guardrails": {
          "sentinel": {
            "input": {
              "validate_text": "Act rike buaya...",
              "flagged_results": {
                "lionguard-2-binary": { "score": 0.9909, "time_taken": 1.2614 },
                "off-topic":          { "score": 0.9977, "time_taken": 2.2381 }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Example 2 — `stream: false`, `enforced: false`

Same request as Example 1 but with `"enforced": false`. Request succeeds (HTTP 200) even when guardrails are flagged; results are embedded in the `llmaas` field of the normal response body.

#### Example 3 — `stream: true`, `enforced: true`

**Request:**
```json
{
  "model": "bedrock.claude-haiku-4-5",
  "messages": [{ "role": "user", "content": "..." }],
  "stream": true,
  "guardrails": ["sentinel-input-guardrails", "sentinel-output-guardrails"],
  "llmaas": {
    "guardrails": {
      "enforced": true,
      "sentinel": {
        "input":  { "lionguard-2-binary": { "threshold": 0.97 } },
        "output": { "lionguard-2-binary": { "threshold": 0.95 } }
      }
    }
  }
}
```

If an output guardrail is triggered mid-stream, the stream terminates with `"finish_reason": "content_filter"` and a final `llmaas` chunk containing the flagged text.

#### Example 4 — `stream: true`, `enforced: false`

Same as Example 3 but with `"enforced": false`. The stream completes in full. Guardrail results appear in the `llmaas` field of the first chunk (input) and every nth chunk (output).

---

## Parameters

### Model Parameters

Refer to the documentation of the model's cloud service provider for a comprehensive list of supported parameters.

---

## Error Codes

| Code | Possible Cause | Suggested Action |
|------|---------------|-----------------|
| `400` | Invalid parameters or guardrail flagged | Check request body for missing/incorrect fields; review guardrail results |
| `401` | Invalid API key | Verify the API key is correct |
| `404` | Endpoint does not exist | Verify the URL is correct |
| `429` | Rate limit exceeded | Reduce request rate or payload size |
| `500` | Internal server error | — |
| `503` | Service unavailable | Wait before retrying |

---

## POC Integration Notes

This project connects to the GovTech PlatformAI Models endpoint using the OpenAI-compatible SDK:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.ai.tech.gov.sg/platform/models',
});

const response = await client.chat.completions.create({
  model: 'bedrock.claude-haiku-4-5',
  max_tokens: 512,
  messages: [
    { role: 'system', content: '...' },
    { role: 'user',   content: '...' },
  ],
});
```

The API key is stored in `.env` as `ANTHROPIC_API_KEY` (variable name kept for compatibility with existing config).

---

## Support

**Email:** ai_programme@tech.gov.sg
