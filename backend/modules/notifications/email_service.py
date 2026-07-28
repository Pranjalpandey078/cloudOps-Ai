import os
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class EmailService:

    def send(self, subject, html):

        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT"))

        smtp_email = os.getenv("SMTP_EMAIL")
        smtp_password = os.getenv("SMTP_APP_PASSWORD")

        message = MIMEMultipart("alternative")

        message["Subject"] = subject
        message["From"] = smtp_email
        message["To"] = smtp_email

        message.attach(
            MIMEText(html, "html")
        )

        server = smtplib.SMTP(
            smtp_host,
            smtp_port
        )

        server.starttls()

        server.login(
            smtp_email,
            smtp_password
        )

        server.sendmail(

            smtp_email,

            smtp_email,

            message.as_string()

        )

        server.quit()