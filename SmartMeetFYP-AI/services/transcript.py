"""
Core logic for the Audio -> Notes/Minutes generator.
Kept separate from main.py so the FastAPI route file stays thin.
"""

import os
import json
from enum import Enum

from fastapi import HTTPException
from openai import OpenAI
from anthropic import Anthropic

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
anthropic_client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


class GenerationType(str, Enum):
    notes = "notes"
    minutes = "minutes"


# ---------------------------------------------------------------------------
# Step 1: transcription
# ---------------------------------------------------------------------------

def transcribe_audio(file_path: str) -> str:
    with open(file_path, "rb") as f:
        result = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
        )
    return result.text


# ---------------------------------------------------------------------------
# Step 2: structuring via Claude
# ---------------------------------------------------------------------------

NOTES_SYSTEM_PROMPT = """You convert a raw classroom lecture transcript into structured study notes.
Return ONLY valid JSON, no prose, no markdown fences, matching this schema:

{
  "title": "string - topic of the lecture",
  "summary": "string - 2-3 sentence overview",
  "explanations": [
    {"heading": "string - concept name", "content": "string - clear explanation of the concept as taught"}
  ],
  "questions_and_answers": [
    {"question": "string - question asked in class", "answer": "string - answer given"}
  ],
  "key_terms": ["string", ...]
}

Rules:
- "explanations" must contain ONLY teaching content (concepts, definitions, walkthroughs).
- "questions_and_answers" must contain ONLY Q&A exchanges that occurred in the audio (student/teacher questions and their answers). Never mix an explanation into this list, and never mix a Q&A exchange into explanations.
- If no Q&A occurred, return an empty list for "questions_and_answers".
"""

MINUTES_SYSTEM_PROMPT = """You convert a raw meeting transcript into formal meeting minutes.
Return ONLY valid JSON, no prose, no markdown fences, matching this schema:

{
  "title": "string - meeting subject",
  "summary": "string - 2-3 sentence overview",
  "attendees": ["string", ...]  ,
  "discussion_points": [
    {"heading": "string - topic discussed", "content": "string - what was discussed/explained"}
  ],
  "questions_and_answers": [
    {"question": "string - question raised", "answer": "string - answer/resolution given"}
  ],
  "decisions": ["string", ...],
  "action_items": [
    {"owner": "string or 'Unassigned'", "task": "string", "due": "string or 'Not specified'"}
  ]
}

Rules:
- "discussion_points" holds explanatory/informational content only (updates, context, proposals explained).
- "questions_and_answers" holds ONLY explicit question -> answer exchanges from the meeting.
- Keep these two lists strictly separate; do not duplicate content between them.
- If attendees aren't stated in the audio, infer only from explicit self-introductions; otherwise leave the list empty.
"""


def structure_transcript(transcript: str, generation_type: GenerationType) -> dict:
    system_prompt = (
        NOTES_SYSTEM_PROMPT if generation_type == GenerationType.notes else MINUTES_SYSTEM_PROMPT
    )

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        system=system_prompt,
        messages=[{"role": "user", "content": f"Transcript:\n\n{transcript}"}],
    )

    raw_text = response.content[0].text.strip()
    raw_text = raw_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse model output as JSON: {e}")


# ---------------------------------------------------------------------------
# Step 3: PDF generation
# ---------------------------------------------------------------------------

def build_pdf(data: dict, generation_type: GenerationType, output_path: str) -> None:
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        topMargin=2 * cm, bottomMargin=2 * cm, leftMargin=2 * cm, rightMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], spaceAfter=12)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = styles["BodyText"]
    italic = ParagraphStyle("Italic", parent=body, fontName="Helvetica-Oblique", spaceAfter=10)

    story = []
    story.append(Paragraph(data.get("title", "Untitled"), h1))
    if data.get("summary"):
        story.append(Paragraph(data["summary"], italic))

    if generation_type == GenerationType.minutes:
        if data.get("attendees"):
            story.append(Paragraph("Attendees", h2))
            story.append(Paragraph(", ".join(data["attendees"]), body))

        story.append(Paragraph("Discussion Points", h2))
        for item in data.get("discussion_points", []):
            story.append(Paragraph(f"<b>{item.get('heading', '')}</b>", body))
            story.append(Paragraph(item.get("content", ""), body))
            story.append(Spacer(1, 6))

        _add_qa_section(story, data.get("questions_and_answers", []), h2, body)

        if data.get("decisions"):
            story.append(Paragraph("Decisions", h2))
            story.append(ListFlowable(
                [ListItem(Paragraph(d, body)) for d in data["decisions"]], bulletType="bullet"
            ))

        if data.get("action_items"):
            story.append(Paragraph("Action Items", h2))
            for ai in data["action_items"]:
                line = f"<b>{ai.get('owner', 'Unassigned')}</b> - {ai.get('task', '')} (Due: {ai.get('due', 'Not specified')})"
                story.append(Paragraph(line, body))

    else:  # notes
        story.append(Paragraph("Explanations", h2))
        for item in data.get("explanations", []):
            story.append(Paragraph(f"<b>{item.get('heading', '')}</b>", body))
            story.append(Paragraph(item.get("content", ""), body))
            story.append(Spacer(1, 6))

        _add_qa_section(story, data.get("questions_and_answers", []), h2, body)

        if data.get("key_terms"):
            story.append(Paragraph("Key Terms", h2))
            story.append(ListFlowable(
                [ListItem(Paragraph(t, body)) for t in data["key_terms"]], bulletType="bullet"
            ))

    doc.build(story)


def _add_qa_section(story, qa_list, h2_style, body_style):
    story.append(Paragraph("Questions & Answers", h2_style))
    if not qa_list:
        story.append(Paragraph("No questions were raised.", body_style))
        return
    for qa in qa_list:
        story.append(Paragraph(f"<b>Q:</b> {qa.get('question', '')}", body_style))
        story.append(Paragraph(f"<b>A:</b> {qa.get('answer', '')}", body_style))
        story.append(Spacer(1, 6))
