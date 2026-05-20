# AI Knowledge Layer

Pattypan's AI layer is an assistant, not an authority.

## Philosophy

- AI recommends; rules validate; users confirm.
- Use confidence language such as likely, possible, worth checking, and confirm before acting.
- Prefer practical actions over long essays.
- Never treat photo diagnosis as final from one image.

## Current Live Uses

- Library: Ask Pattypan for gardening questions and topic-aware help.
- Topic screens: Pests & Bugs, Diseases, Plant Care, Propagation, and Growing From Seed can ask targeted questions.
- Bed Detail: AI Optimize Bed can review bed dimensions, current plants, sun, spacing, and companion context.
- Diagnosis boundary: PlantNet can identify the plant, then OpenAI can explain possible issues and safe next checks.

## Fallback Behavior

If OpenAI is unavailable, Pattypan returns local rule-based guidance for common cases such as yellow leaves, mildew risk, seed starting, and general garden checks. The fallback is clearly lower confidence.

## Next Layer

- Persist diagnosis history as first-class records linked to PlantInstance and PlantPhoto.
- Add structured AI JSON outputs for bed optimization and diagnosis.
- Route production AI calls through a server-side API.
- Add source-linked Library articles so AI answers can cite trusted local knowledge.
