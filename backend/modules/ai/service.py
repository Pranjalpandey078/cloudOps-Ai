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

        analysis = self.provider.analyze_incident(
            incident
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