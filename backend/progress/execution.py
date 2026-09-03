import json
import os
import subprocess
import tempfile


def execute_python_code(code, input_data):
    """
    Execute submitted Python code against one test case.

    Development implementation only.
    For production, this should be replaced with
    a properly isolated sandbox/container.
    """

    input_json = json.dumps(input_data)

    runner_code = f"""
import json

input_data = json.loads({input_json!r})

{code}

if "solution" in globals():
    result = solution(**input_data)
    print(json.dumps(result))
else:
    print(json.dumps({{"error": "solution function not found"}}))
"""

    temp_file = None

    try:
        # Create temporary Python file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as file:
            file.write(runner_code)
            temp_file = file.name

        # Run the student's code
        result = subprocess.run(
            ["python", temp_file],
            capture_output=True,
            text=True,
            timeout=3
        )

        # Code execution failed
        if result.returncode != 0:
            return {
                "success": False,
                "output": None,
                "error": result.stderr.strip()
            }

        # Get output
        output = result.stdout.strip()

        # Convert JSON output back into Python value
        try:
            output = json.loads(output)
        except json.JSONDecodeError:
            pass

        return {
            "success": True,
            "output": output,
            "error": None
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": None,
            "error": "Execution timed out."
        }

    except Exception as error:
        return {
            "success": False,
            "output": None,
            "error": str(error)
        }

    finally:
        # Delete temporary file
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


def run_test_case(code, language, test_case):
    """
    Run submitted code against one TestCase.
    """

    # Currently only Python is supported
    if language != "PYTHON":
        return {
            "success": False,
            "passed": False,
            "output": None,
            "error": "Only Python execution is supported currently."
        }

    result = execute_python_code(
        code=code,
        input_data=test_case.input_data
    )

    # Execution error
    if not result["success"]:
        return {
            "success": False,
            "passed": False,
            "output": None,
            "error": result["error"]
        }

    # Compare student's output with expected output
    passed = (
        result["output"] == test_case.expected_output
    )

    return {
        "success": True,
        "passed": passed,
        "output": result["output"],
        "error": None
    }