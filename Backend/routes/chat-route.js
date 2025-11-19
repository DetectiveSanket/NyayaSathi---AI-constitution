// src/routes/chatRoutes.js
import { Router } from "express";
import { sendMessage, getConversation, listModels } from "../controllers/chat-controller.js";
import { protect, admin } from "../middleware/auth.js";
import rateLimiter from "../middleware/rateLimiter.js";
import validateRequest from "../middleware/validateRequest.js";
import { body } from "express-validator";

const router = Router();

// POST /chat/send
router.post(
  "/send",
  protect,
  rateLimiter,
  [
    body("message").notEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  sendMessage
);

// GET /chat/models
router.get(
  "/models",
  protect,
  listModels
);

// GET /chat/:conversationId -> Get conversation by ID
router.get(
  "/:conversationId",
  protect,
  getConversation
);


export default router;
