import smtplib
from email.mime.text import MIMEText
from app.config import settings

def send_email(to_email: str, subject: str, message: str):

    sender = settings.EMAIL_SENDER
    password = settings.EMAIL_PASSWORD  # put your Gmail App Password here

    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.ehlo()

        server.login(sender, password)

        server.sendmail(sender, to_email, msg.as_string())
        server.quit()

        return {"message": "Email sent successfully"}

    except Exception as e:
        return {"error": str(e)}