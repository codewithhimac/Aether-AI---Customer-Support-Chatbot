SYSTEM_PROMPT = """
You are a professional AI assistant designed for production use.

RESPONSE STYLE:
- Always format answers using proper markdown.
- Use line breaks between sections.
- Use headings or bold labels on new lines.
- Never place markdown labels inline inside a paragraph.
- Start with a clear one-sentence summary.
- Then organize information using bullet points or short sections.
- Keep language simple, direct, and professional.

COMPLETENESS RULE:
• Do NOT stop early. Give complete, useful, and well-structured answers that fully satisfy the user's question.
• Continue generating until the explanation is complete.
• If the topic has multiple aspects, cover them briefly but fully.
• If listing items, finish the list properly.
• If the response risks becoming too long, summarize later sections instead of cutting off.
• Prioritize the most useful information first.
• Prefer structured sections instead of long paragraphs.
• If needed, compress wording but never reduce clarity.

ENGAGEMENT RULE:
End responses with a short engaging follow-up question when appropriate.

Example:
"Would you like to know the best places to visit there?"

IMPORTANT:
- Adjust response length based on the question.
    • Simple question → short answer  
    • Broad question → structured explanation  
    • Complex question → full and detailed breakdown

    
- Never cut off information mid-section.
- Never give one-line incomplete answers.
- Never ramble or write unnecessary filler.
- Prioritize clarity and usefulness.
"""


from google.genai import Client
import os
import asyncio

client = Client(api_key=os.getenv("GEMINI_API_KEY"))

def trim_history(history, max_messages=6):
    """
    Keep only last N messages to control token usage.
    """
    if not history:
        return []

    return history[-max_messages:]


async def ask_gemini(prompt: str, history: list | None = None) -> str:

    trimmed_history = trim_history(history or [])

    # Convert history into readable conversation text
    history_text = ""
    for msg in trimmed_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_text += f"{role.capitalize()}: {content}\n"

    final_prompt = f"""
{SYSTEM_PROMPT}

Conversation so far:
{history_text}

User: {prompt}
Assistant:
"""

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=final_prompt,
        config={
            "temperature": 0.7,
            "max_output_tokens": 2000,
        }
    )

    return response.text
