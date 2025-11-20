# NyayaSathi – AI Constitution

NyayaSathi is an AI-powered legal assistant platform that helps users upload, process, and analyze legal documents using advanced text extraction, chunking, and retrieval-augmented generation (RAG) techniques. The project consists of a modern React frontend and a robust Node.js backend.

---

## Features
- Upload and manage legal documents (PDF/DOCX)
- Extract and clean text (no OCR, in-memory only)
- Chunk text for RAG and vector search
- Semantic search and AI-powered Q&A
- User authentication and profile management
- Email notifications
- Modern, responsive UI

---

## Tech Stack
### Frontend
- React (Vite, TypeScript)
- Tailwind CSS
- Redux (state management)
- Axios (API calls)
- Modern UI components

### Backend
- Node.js (ESM, v22+)
- Express.js
- MongoDB & Mongoose
- AWS S3 (file storage)
- pdf-parse, mammoth (text extraction)
- Pinecone (vector DB)
- Google Gemini, LangChain (AI/LLM)
- Nodemailer (SMTP)

---

## Folder Structure
```
NyayaSathi---AI-constitution/
├── Backend/         # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── DB/
│   ├── utils/
│   ├── workflows/
│   └── ...
├── Frontend/        # React frontend
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   └── ...
└── README.md        # Project overview
```

---

## Setup Instructions
### Backend
1. Navigate to `Backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (see `.env.example`)
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to `Frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## API Example
- `POST /api/v1/rag/process/:documentId` — Process a document and return text chunks for RAG.

---

## License
MIT
