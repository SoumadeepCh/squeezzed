1. Fixing the OpenAI API "Insufficient Credit" Issue

If you’re using the free trial, the credits expire quickly. You’ll need to add a payment method or switch to a free model (like gpt-4o-mini) if you want to continue without paying much.

You can also set rate limits in your code to avoid burning credits too fast.

2. Hugging Face Alternatives

The Hugging Face models you tried may not be specialized for quiz generation. Many text-generation models aren’t optimized for constraints like no duplicates or sticking strictly to a topic.

Instead, try:

Flan-T5 (Google) → Good for instruction-following tasks. You can prompt it like:
“Generate 10 unique multiple-choice questions on {topic}, each with 4 options and 1 correct answer.”

Llama 3 (Meta, hosted on HF Inference API) → More reliable than smaller models.

3. A Better Architecture (to avoid duplicates & wrong-topic Qs)

Instead of asking the model to “just generate questions,” build a small pipeline:

User Input: Topic (e.g., "Data Structures in C").

Generate Questions: Ask model for 2–3x more questions than needed.

Filter Duplicates: Run questions through a similarity check (e.g., cosine similarity with sentence-transformers).

Validate Topic: Use keyword checking (or another AI call) to ensure relevance.

Output Final Quiz: Clean, unique, topic-relevant questions.

4. Free / Cheap AI Options

Local models: Run models like flan-t5-large or mistral-7b-instruct on your machine with transformers + bitsandbytes (for GPU).

Cloud-Free APIs:

Ollama (runs LLaMA, Mistral locally, easy setup).

LM Studio (desktop app for running LLMs offline).