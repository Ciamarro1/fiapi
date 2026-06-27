# 🧠 FIAPI AI Platform

<div align="center">
  <p><strong>A Modular, Serverless AI Ecosystem powered by Cloudflare Workers AI & Hono</strong></p>
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" alt="Hono" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <br/>
  <br/>
</div>

## 🌌 Overview

The **FIAPI AI Platform** is a unified, high-performance API that acts as a gateway to multiple state-of-the-art AI models. Built on the edge using [Cloudflare Workers](https://workers.cloudflare.com/) and [Hono](https://hono.dev/), it provides 8 specialized AI domains through a single, consistent REST interface.

Designed by the **Lyzer Labs Autonomous Factory** and governed by the CIA/CTO/Ponytail council, it enforces strict rate limiting, Bearer token authentication, and a standardized JSON response envelope across all services.

## 🚀 The 8 AI Domains

FIAPI exposes its functionality via 8 modular routing boundaries under `/v1`:

| Domain | Base Endpoint | Description | Key Models |
| :--- | :--- | :--- | :--- |
| 🖼️ **Images** | `/v1/images` | Text-to-image generation | `Flux 1 Schnell`, `SDXL Lightning` |
| 💬 **Chat** | `/v1/chat` | Conversational LLMs | `Llama 3 8B/70B`, `Mistral 7B`, `Gemma` |
| 🧠 **Embeddings** | `/v1/embeddings` | Text vectorization | `BGE Base/Large/Small` |
| 👁️ **Vision** | `/v1/vision` | Image-to-text analysis | `LLaVA 1.5 7B`, `UForm Gen2` |
| 🎤 **Audio** | `/v1/audio` | Speech-to-text transcription | `Whisper`, `Whisper Large v3 Turbo` |
| 🎥 **Video** | `/v1/video` | Video generation | *(Preview / Stub)* |
| 📈 **Market** | `/v1/market` | AI-powered sentiment & signals | `Llama 3 8B (Lyzer Context)` |
| 🤖 **Agent** | `/v1/agent` | Autonomous task execution | `Llama 3 8B/70B (Governance Logic)` |

---

## 🛠️ Architecture

*   **Framework:** Hono (ultra-fast web framework for the Edge).
*   **Infrastructure:** Cloudflare Workers (global serverless deployment).
*   **AI Engine:** Cloudflare Workers AI bindings (`env.AI`).
*   **Modularity:** Each domain has its own isolated router (`src/routers/*.js`), managed by a central index (`src/index.js`).
*   **Shared Platform:** Common utilities (`src/utils/platform.js`) enforce a uniform response structure.

### Standard Response Envelope
All successful requests return a consistent payload:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-06-27T08:00:00Z"
  }
}
```

---

## 🚦 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-and-update/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Ciamarro1/fiapi.git
    cd fiapi
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the local development server:
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:8787`.

---

## 🧪 Testing

FIAPI enforces a **100% test passing requirement** via the Autonomous Factory's Continuous Verification pillar. The test suite includes robust E2E coverage for happy paths, boundary conditions, combinatorial cases, and rate limit exhaustion.

*   **Run End-to-End (E2E) Tests:**
    ```bash
    npm run test:e2e
    ```

*   **Run Unit Tests:**
    ```bash
    npm run test:unit
    ```

*(Note: The E2E runner automatically spins up a `wrangler dev` instance, sets `MOCK_AI=true`, polls for health, runs the Vitest/Node suite, and tears down the server).*

---

## 🔒 Security & Middleware

*   **Authentication:** `authMiddleware` intercepts all requests requiring a valid `Bearer` token defined in `env.AUTH_TOKEN`.
*   **Rate Limiting:** `rateLimitMiddleware` prevents abuse by enforcing IP/Token-based token bucket limits (e.g., 5 requests per 10s by default). Responds with `429 Too Many Requests` and `Retry-After` headers.

---

## 📖 API Documentation

The platform hosts its own self-documenting HTML page. When the server is running, navigate to:

👉 **`http://localhost:8787/docs`**

To discover all available domains and models programmatically, hit the platform root:
```bash
curl http://localhost:8787/v1
```

---

<div align="center">
  <sub>Built with Cognitive Governance by the Lyzer Labs Autonomous Factory.</sub>
</div>
