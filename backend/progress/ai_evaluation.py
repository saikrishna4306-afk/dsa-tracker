import json
import os

from langchain_openrouter import ChatOpenRouter
from langchain_core.prompts import ChatPromptTemplate


# =========================================================
# AI MODEL FALLBACK ORDER
# =========================================================

AI_MODELS = [
    
    "minimax/minimax-m3:free",
    "minimax/minimax-m2.7:free",
    "dots-studio/dots-3-note-preview:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
]


# =========================================================
# VALIDATE AI RESULT
# =========================================================

def validate_ai_result(result):
    required_score_fields = {
        "algorithm_score": 25,
        "time_complexity_score": 15,
        "space_complexity_score": 10,
        "code_quality_score": 10,
    }

    required_text_fields = [
        "algorithm_feedback",
        "time_complexity",
        "space_complexity",
        "code_quality_feedback",
        "overall_feedback",
    ]

    # -----------------------------------------------------
    # Validate score fields
    # -----------------------------------------------------

    for field, maximum in required_score_fields.items():

        if field not in result:
            raise ValueError(
                f"AI response missing field: {field}"
            )

        try:
            score = float(result[field])
        except (TypeError, ValueError):
            raise ValueError(
                f"Invalid score for {field}: {result[field]}"
            )

        if score < 0 or score > maximum:
            raise ValueError(
                f"Invalid {field}: {score}. "
                f"Allowed range: 0-{maximum}"
            )

        result[field] = score

    # -----------------------------------------------------
    # Validate feedback fields
    # -----------------------------------------------------

    for field in required_text_fields:

        if field not in result:
            raise ValueError(
                f"AI response missing field: {field}"
            )

        if result[field] is None:
            result[field] = ""

        if not isinstance(result[field], str):
            result[field] = str(result[field])

    return result


# =========================================================
# CLEAN JSON RESPONSE
# =========================================================

def clean_json_response(content):

    # -----------------------------------------------------
    # Handle list response
    # -----------------------------------------------------

    if isinstance(content, list):

        text_parts = []

        for item in content:

            if isinstance(item, dict):
                text_parts.append(
                    item.get("text", "")
                )

            elif isinstance(item, str):
                text_parts.append(item)

        content = "".join(text_parts)

    # -----------------------------------------------------
    # Convert to string
    # -----------------------------------------------------

    if not isinstance(content, str):
        content = str(content)

    content = content.strip()

    # -----------------------------------------------------
    # Remove markdown code fences
    # -----------------------------------------------------

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    return content.strip()


# =========================================================
# CREATE EVALUATION PROMPT
# =========================================================

def create_evaluation_prompt():

    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an expert DSA interviewer and programming evaluator.

Your task is to evaluate the quality of a student's
programming solution.

The backend has already executed the student's code
against test cases.

IMPORTANT:

Do NOT determine correctness based on your own reasoning.

The backend separately calculates correctness based on
test case results.

You must evaluate ONLY the following four categories:

1. Algorithm / Approach
2. Time Complexity
3. Space Complexity
4. Code Quality


==================================================
SCORING
==================================================

Algorithm / Approach: 25 points

Time Complexity: 15 points

Space Complexity: 10 points

Code Quality: 10 points

Total AI score: 60 points.

The backend combines this with correctness:

Correctness: 40 points
AI Evaluation: 60 points
Total: 100 points


==================================================
ALGORITHM / APPROACH
==================================================

Evaluate:

- Choice of algorithm
- Choice of data structures
- Efficiency of the approach
- Whether a significantly better approach exists
- Whether the implementation follows the intended approach


==================================================
TIME COMPLEXITY
==================================================

Determine the actual time complexity of the submitted code.

Do NOT give full marks simply because an optimal algorithm
exists.

Evaluate the code that was actually submitted.


==================================================
SPACE COMPLEXITY
==================================================

Determine the auxiliary space used by the submitted code.

Consider:

- Arrays
- Hash maps
- Sets
- Recursion stack
- Other data structures

Do not count the input itself as additional space unless
the algorithm creates an additional copy.


==================================================
CODE QUALITY
==================================================

Evaluate:

- Readability
- Naming
- Structure
- Maintainability
- Language conventions
- Unnecessary code
- Simplicity


==================================================
IMPORTANT
==================================================

Evaluate the ACTUAL submitted code.

Do not assume missing code exists.

Do not invent implementation details.

Do not determine correctness independently.

Be honest about inefficient algorithms.

Give constructive feedback.


==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT use ```json.

Do NOT include any explanation outside the JSON.

Return exactly this structure:

{{
    "algorithm_score": 0,
    "time_complexity_score": 0,
    "space_complexity_score": 0,
    "code_quality_score": 0,

    "algorithm_feedback": "",
    "time_complexity": "",
    "space_complexity": "",
    "code_quality_feedback": "",
    "overall_feedback": ""
}}


Maximum scores:

algorithm_score: 25
time_complexity_score: 15
space_complexity_score: 10
code_quality_score: 10
""",
            ),
            (
                "human",
                """
Evaluate the following student's DSA solution.

Problem:
{question}

Topic:
{topic}

Difficulty:
{difficulty}

Language:
{language}

Student Code:
{code}

Return ONLY the required JSON object.
""",
            ),
        ]
    )


# =========================================================
# CREATE OPENROUTER MODEL
# =========================================================

def create_model(model_name):

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not configured."
        )

    return ChatOpenRouter(
        model=model_name,
        api_key=api_key,
        temperature=0,
        max_tokens=1000,
    )


# =========================================================
# EVALUATE USING ONE MODEL
# =========================================================

def evaluate_with_model(
    model_name,
    question,
    code,
    language,
):

    print(
        f"Starting AI evaluation with model: {model_name}"
    )

    prompt = create_evaluation_prompt()

    model = create_model(model_name)

    chain = prompt | model

    response = chain.invoke(
        {
            "question": question.title,
            "topic": question.topic,
            "difficulty": question.difficulty,
            "language": language,
            "code": code,
        }
    )

    # -----------------------------------------------------
    # Extract response
    # -----------------------------------------------------

    content = clean_json_response(
        response.content
    )

    print(
        f"AI response received from: {model_name}"
    )

    # -----------------------------------------------------
    # Parse JSON
    # -----------------------------------------------------

    try:

        result = json.loads(content)

    except json.JSONDecodeError:

        raise ValueError(
            f"AI returned invalid JSON from "
            f"{model_name}: {content}"
        )

    # -----------------------------------------------------
    # Validate result
    # -----------------------------------------------------

    result = validate_ai_result(result)

    return result


# =========================================================
# MAIN EVALUATION FUNCTION
# =========================================================

def evaluate_solution(
    question,
    code,
    language,
):

    last_error = None

    # -----------------------------------------------------
    # Try models one by one
    # -----------------------------------------------------

    for index, model_name in enumerate(AI_MODELS):

        try:

            print(
                f"AI fallback attempt "
                f"{index + 1}/{len(AI_MODELS)}"
            )

            result = evaluate_with_model(
                model_name=model_name,
                question=question,
                code=code,
                language=language,
            )

            print(
                f"AI evaluation successful using "
                f"{model_name}"
            )

            return result

        except Exception as error:

            last_error = error

            print(
                f"AI model failed: {model_name}"
            )

            print(
                f"Error: {str(error)}"
            )

            # ---------------------------------------------
            # Try next model
            # ---------------------------------------------

            if index < len(AI_MODELS) - 1:

                print(
                    "Trying next AI fallback model..."
                )

            else:

                print(
                    "No more AI fallback models available."
                )

    # -----------------------------------------------------
    # All models failed
    # -----------------------------------------------------

    raise RuntimeError(
        "All AI evaluation models failed. "
        f"Last error: {str(last_error)}"
    )