from modules.notifications.email_service import EmailService


class NotificationService:

    email = EmailService()

    def send_incident_email(self, incident):

        subject = f"[{incident['severity']}] {incident['title']}"

        html = f"""
        <html>

        <body>

        <h2>🚨 CloudOps AI Alert</h2>

        <table border="1" cellpadding="8">

            <tr>
                <td><b>Server</b></td>
                <td>{incident['server_id']}</td>
            </tr>

            <tr>
                <td><b>Severity</b></td>
                <td>{incident['severity']}</td>
            </tr>

            <tr>
                <td><b>Metric</b></td>
                <td>{incident['metric_name']}</td>
            </tr>

            <tr>
                <td><b>Current Value</b></td>
                <td>{incident['metric_value']}</td>
            </tr>

            <tr>
                <td><b>Threshold</b></td>
                <td>{incident['threshold_value']}</td>
            </tr>

            <tr>
                <td><b>Description</b></td>
                <td>{incident['description']}</td>
            </tr>

        </table>

        <br>

        <p>
        Generated automatically by
        <b>CloudOps AI Monitoring Engine</b>.
        </p>

        </body>

        </html>
        """

        self.email.send(
            subject,
            html
        )