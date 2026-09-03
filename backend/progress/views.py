from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .ai_evaluation import evaluate_solution
from drf_spectacular.utils import extend_schema

from .models import (
    UserSelection,
    DailyQuestion,
    CodeSubmission,
    TestCase,
)

from .serializers import (
    UserSelectionSerializer,
    DailyQuestionSerializer,
    CodeSubmissionSerializer,
    TestCaseSerializer,
)

from .execution import run_test_case


class UserSelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selections = UserSelection.objects.filter(
            user=request.user
        ).order_by("-selected_at")

        serializer = UserSelectionSerializer(
            selections,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = UserSelectionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            selection = serializer.save(
                user=request.user
            )

            return Response(
                UserSelectionSerializer(selection).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserSelectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            selection = UserSelection.objects.get(
                pk=pk,
                user=request.user
            )

        except UserSelection.DoesNotExist:
            return Response(
                {
                    "detail": "Progress record not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSelectionSerializer(
            selection,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class DailyQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone

        today = timezone.localdate()

        try:
            daily_question = DailyQuestion.objects.get(
                date=today
            )

        except DailyQuestion.DoesNotExist:
            return Response(
                {
                    "detail": "No daily question found for today."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DailyQuestionSerializer(
            daily_question
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class CodeSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = CodeSubmission.objects.filter(
            user=request.user
        ).order_by("-submitted_at")

        serializer = CodeSubmissionSerializer(
            submissions,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=CodeSubmissionSerializer,
        responses=CodeSubmissionSerializer,
    )
    def post(self, request):

        # -----------------------------------
        # 1. Validate submission
        # -----------------------------------

        serializer = CodeSubmissionSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------
        # 2. Save initial submission
        # -----------------------------------

        submission = serializer.save(
            user=request.user
        )

        # -----------------------------------
        # 3. Get test cases
        # -----------------------------------

        test_cases = TestCase.objects.filter(
            question=submission.question
        ).order_by("id")

        total_test_cases = test_cases.count()

        submission.total_test_cases = total_test_cases

        submission.status = (
            CodeSubmission.SubmissionStatus.RUNNING
        )

        submission.save()

        # -----------------------------------
        # 4. Execute test cases
        # -----------------------------------

        passed_count = 0
        test_results = []

        for test_case in test_cases:

            result = run_test_case(
                code=submission.code,
                language=submission.language,
                test_case=test_case
            )

            if result["passed"]:
                passed_count += 1

            test_result = {
                "test_case_id": test_case.id,
                "passed": result["passed"],
            }

            # Never expose hidden test data
            if not test_case.is_hidden:
                test_result["input"] = (
                    test_case.input_data
                )

                test_result["expected_output"] = (
                    test_case.expected_output
                )

                test_result["actual_output"] = (
                    result["output"]
                )

            test_results.append(test_result)

        # -----------------------------------
        # 5. Save test results
        # -----------------------------------

        submission.test_results = test_results

        submission.test_cases_passed = passed_count

        # -----------------------------------
        # 6. Calculate correctness score
        # -----------------------------------

        if total_test_cases > 0:

            correctness_score = (
                passed_count / total_test_cases
            ) * 40

        else:

            correctness_score = 0

        # -----------------------------------
        # 7. Determine submission status
        # -----------------------------------

        if total_test_cases == 0:

            submission.status = (
                CodeSubmission.SubmissionStatus.ERROR
            )

            submission.feedback = (
                "No test cases are available "
                "for this question."
            )

        elif passed_count == total_test_cases:

            submission.status = (
                CodeSubmission.SubmissionStatus.PASSED
            )

            submission.feedback = (
                "All test cases passed."
            )

        else:

            submission.status = (
                CodeSubmission.SubmissionStatus.FAILED
            )

            submission.feedback = (
                f"{passed_count} out of "
                f"{total_test_cases} "
                f"test cases passed."
            )

        # -----------------------------------
        # 8. Save correctness score
        # -----------------------------------

        submission.score = correctness_score

        submission.save()

        # -----------------------------------
        # 9. AI evaluation
        # -----------------------------------

        try:

            ai_result = evaluate_solution(
                question=submission.question,
                code=submission.code,
                language=submission.language,
            )

            # -------------------------------
            # AI scores
            # -------------------------------

            submission.algorithm_score = (
                ai_result["algorithm_score"]
            )

            submission.time_complexity_score = (
                ai_result["time_complexity_score"]
            )

            submission.space_complexity_score = (
                ai_result["space_complexity_score"]
            )

            submission.code_quality_score = (
                ai_result["code_quality_score"]
            )

            # -------------------------------
            # AI feedback
            # -------------------------------

            submission.algorithm_feedback = (
                ai_result["algorithm_feedback"]
            )

            submission.time_complexity = (
                ai_result["time_complexity"]
            )

            submission.space_complexity = (
                ai_result["space_complexity"]
            )

            submission.code_quality_feedback = (
                ai_result["code_quality_feedback"]
            )

            submission.overall_feedback = (
                ai_result["overall_feedback"]
            )

            # -----------------------------------
            # 10. Calculate final score /100
            # -----------------------------------

            ai_score = (
                submission.algorithm_score
                + submission.time_complexity_score
                + submission.space_complexity_score
                + submission.code_quality_score
            )

            submission.score = (
                correctness_score + ai_score
            )

            # -----------------------------------
            # 11. Save final result
            # -----------------------------------

            submission.save()

        except Exception as error:

            # AI failure should NOT destroy
            # the successful code submission.

            print(
                "AI evaluation failed:",
                str(error)
            )

            submission.feedback = (
                f"{submission.feedback} "
                "AI evaluation is currently unavailable."
            )

            submission.save()

        # -----------------------------------
        # 12. Return final submission
        # -----------------------------------

        return Response(
            CodeSubmissionSerializer(
                submission
            ).data,
            status=status.HTTP_201_CREATED
        )


class RunCodeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CodeSubmissionSerializer,
        responses=dict,
    )
    def post(self, request):
        """
        Run code against visible test cases only.

        This does NOT create a CodeSubmission record.
        """

        # -----------------------------------------
        # 1. Validate request
        # -----------------------------------------

        question_id = request.data.get("question")
        language = request.data.get("language")
        code = request.data.get("code")

        if not question_id:
            return Response(
                {
                    "detail": "Question is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not language:
            return Response(
                {
                    "detail": "Language is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not code:
            return Response(
                {
                    "detail": "Code is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # 2. Get visible test cases only
        # -----------------------------------------

        test_cases = TestCase.objects.filter(
            question_id=question_id,
            is_hidden=False
        ).order_by("id")

        total_test_cases = test_cases.count()

        if total_test_cases == 0:
            return Response(
                {
                    "detail": (
                        "No visible test cases are "
                        "available for this question."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # 3. Run every visible test case
        # -----------------------------------------

        passed_count = 0
        test_results = []

        for test_case in test_cases:

            result = run_test_case(
                code=code,
                language=language,
                test_case=test_case
            )

            if result["passed"]:
                passed_count += 1

            test_result = {
                "test_case_id": test_case.id,
                "passed": result["passed"],
                "input": test_case.input_data,
                "expected_output": test_case.expected_output,
                "actual_output": result["output"],
            }

            if result["error"]:
                test_result["error"] = result["error"]

            test_results.append(test_result)

        # -----------------------------------------
        # 4. Determine status
        # -----------------------------------------

        if passed_count == total_test_cases:
            final_status = "PASSED"
        else:
            final_status = "FAILED"

        # -----------------------------------------
        # 5. Return result
        # -----------------------------------------

        return Response(
            {
                "status": final_status,
                "test_cases_passed": passed_count,
                "total_test_cases": total_test_cases,
                "test_results": test_results,
            },
            status=status.HTTP_200_OK
        )


class TestCaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get test cases.

        Admin:
            Can see visible and hidden test cases.

        Normal user:
            Can only see visible test cases.

        Optional query parameter:

            ?question=1
        """

        question_id = request.query_params.get(
            "question"
        )

        test_cases = TestCase.objects.all().order_by("id")

        # -----------------------------------------
        # Filter by question
        # -----------------------------------------

        if question_id:
            test_cases = test_cases.filter(
                question_id=question_id
            )

        # -----------------------------------------
        # Hide hidden test cases from users
        # -----------------------------------------

        if request.user.role != "ADMIN":

            test_cases = test_cases.filter(
                is_hidden=False
            )

        serializer = TestCaseSerializer(
            test_cases,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=TestCaseSerializer,
        responses=TestCaseSerializer,
    )
    def post(self, request):
        """
        Create a test case.

        Only ADMIN users can create test cases.
        """

        # -----------------------------------------
        # Check admin
        # -----------------------------------------

        if request.user.role != "ADMIN":

            return Response(
                {
                    "detail": (
                        "Only admins can create test cases."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -----------------------------------------
        # Validate test case
        # -----------------------------------------

        serializer = TestCaseSerializer(
            data=request.data
        )

        if serializer.is_valid():

            test_case = serializer.save()

            return Response(
                TestCaseSerializer(
                    test_case
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )