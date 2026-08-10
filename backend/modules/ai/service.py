import json

from modules.ai.factory import AIProviderFactory


class AIService:


    def chat(self, question):

        prompt = f"""
        You are a Senior DevOps Engineer.

        Answer the following question professionally.

        Question:

        {question}
        """

        return self.provider.generate(prompt)

    def __init__(self):
        self.provider = AIProviderFactory.get_provider()

    def analyze_incident(self, incident):

        raw_analysis = self.provider.analyze_incident(
            incident
        )

        if isinstance(raw_analysis, dict):
            analysis = raw_analysis
        else:
            try:
                analysis = json.loads(
                    raw_analysis.strip()
                )
            except (
                json.JSONDecodeError,
                AttributeError
            ) as error:
                raise ValueError(
                    "AI provider returned invalid JSON analysis"
                ) from error

        required_fields = {
            "root_cause",
            "impact",
            "severity_assessment",
            "recommended_actions",
            "prevention_steps",
            "confidence"
        }

        missing_fields = (
            required_fields - set(analysis.keys())
        )

        if missing_fields:
            raise ValueError(
                "AI analysis missing required fields: "
                + ", ".join(sorted(missing_fields))
            )

        if not isinstance(
            analysis["recommended_actions"],
            list
        ):
            raise ValueError(
                "recommended_actions must be a list"
            )

        if not isinstance(
            analysis["prevention_steps"],
            list
        ):
            raise ValueError(
                "prevention_steps must be a list"
            )

        confidence = analysis["confidence"]

        if (
            not isinstance(confidence, (int, float))
            or isinstance(confidence, bool)
            or not 0.0 <= confidence <= 1.0
        ):
            raise ValueError(
                "confidence must be between 0.0 and 1.0"
            )

        return {
            "analysis": analysis
        }

    def generate_remediation(self, incident):

        remediation = self.provider.remediation(
            incident
        )

        return {
            "remediation": remediation
        }

    def chat_with_incident(self, incident, question):

        prompt = f"""
You are a Senior Cloud DevOps Engineer.

Incident Details

Title:
{incident['title']}

Description:
{incident['description']}

Severity:
{incident['severity']}

Metric:
{incident['metric_name']}

Current Value:
{incident['metric_value']}

Threshold:
{incident['threshold_value']}

Question:
{question}

Answer like an experienced Site Reliability Engineer.
"""

        return self.provider.generate(prompt)