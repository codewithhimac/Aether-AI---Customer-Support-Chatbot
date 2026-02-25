import React from 'react';
import { 
  Send,
  Bot,
  User,
  Plus,
  Trash,
  History,
  ChevronLeft,
  ChevronRight
} from "lucide-react";


export const APP_CONFIG = {
  MODEL_NAME: "models/gemini-2.5-flash",
  TEMPERATURE: 0.7,
  MAX_HISTORY: 20,
};

export const SYSTEM_PROMPT = `
You are Aether Support AI, a production-grade customer support specialist for Aether SaaS. 
Your goal is to provide helpful, concise, and professional assistance.

Core Guidelines:
1. Tone: Professional, empathetic, and efficient.
2. Scope: Handle FAQs, refund inquiries, order tracking, and troubleshooting.
3. Hallucinations: If you are unsure about specific account data (like a real order ID), acknowledge that you can only see demo data and offer to escalate.
4. Escallation: If a user is frustrated or you cannot resolve a complex issue, politely suggest: "I'll escalate this to our human support team. They will reach out via email within 24 hours."
5. Formatting: Use Markdown for lists, tables, and bold text to improve readability.
6. Identity: You are an AI model, not a human.

Sample Context:
- Refund Policy: 30 days money-back guarantee.
- Support Email: support@aether.ai
- Pricing: Basic ($19/mo), Pro ($49/mo), Enterprise (Contact us).
`;

export const INITIAL_MESSAGES: any[] = [
  {
    role: 'assistant',
    content: "Hi there! I'm Aether Support AI. How can I help you today?",
    timestamp: Date.now(),
  }
];

export const ICONS = {
  Send,
  Bot,
  User,
  Plus,
  Trash,
  History,
  ChevronLeft,
  ChevronRight,
};
