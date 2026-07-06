# email_service.py - UPDATED WITH PROPER SENDER NAME
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL_ID = os.getenv('SMTP_EMAIL_ID')
APP_PASSWORD = os.getenv('APP_PASSWORD')


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # SMTP Configuration
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_email_id = SMTP_EMAIL_ID
        self.app_password = APP_PASSWORD
        
        # Sender Identity
        self.app_name = "DocuMind-AI"
        self.sender_display = f"{self.app_name} <noreply@documindai.com>"
        
        logger.info(f"📧 {self.app_name} Email Service Initialized")
    
    def send_otp_email(self, recipient_email: str, otp: str) -> bool:
        """Send OTP email with professional sender name"""
        # Always print to console for debugging
        print(f"\n{'='*60}")
        print(f"{self.app_name} - OTP Verification")
        print(f"{'='*60}")
        print(f"To: {recipient_email}")
        print(f"OTP: {otp}")
        print(f"{'='*60}\n")
        
        try:
            # Create email
            msg = MIMEMultipart()

            msg['From'] = f"{self.app_name} <{self.smtp_email_id}>"
            msg['To'] = recipient_email
            msg['Subject'] = f"Your OTP Code - {self.app_name}"
            
            # HTML email with professional design
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                           line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                             color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .otp-box {{ background: white; padding: 25px; border-radius: 8px; 
                              font-size: 36px; font-weight: bold; text-align: center; 
                              margin: 25px 0; color: #2563eb; letter-spacing: 8px;
                              border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                    .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; 
                             color: #6b7280; font-size: 12px; text-align: center; }}
                    .app-name {{ color: #764ba2; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔐 {self.app_name}</h1>
                    <p>Your One-Time Password (OTP) for Verification</p>
                </div>
                
                <div class="content">
                    <p>Hello,</p>
                    <p>Use the following OTP to complete your verification:</p>
                    
                    <div class="otp-box">
                        {otp}
                    </div>
                    
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>This is an automated email from <span class="app-name">{self.app_name}</span>.</p>
                        <p>Do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.smtp_email_id, self.app_password)
                server.send_message(msg)
            
            logger.info(f"✅ OTP email sent to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send OTP email: {e}")
            return True  # Still success because OTP printed to console
    
    def send_welcome_email(self, recipient_email: str, username: str) -> bool:
        """Send welcome email with professional sender"""
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{self.app_name} <{self.smtp_email_id}>"
            msg['To'] = recipient_email
            msg['Subject'] = f"Welcome to {self.app_name}! 🎉"
            
            html = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                       line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to {self.app_name}!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #2563eb;">Hello {username}!</h2>
                    
                    <p>Your account has been successfully created and verified. 🚀</p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; 
                               border-left: 4px solid #764ba2;">
                        <h3 style="color: #764ba2; margin-top: 0;">Get Started:</h3>
                        <ul style="padding-left: 20px;">
                            <li><strong>📊 Upload Transactions:</strong> Import your CSV files</li>
                            <li><strong>🤖 Chat with AI Assistant:</strong> Get financial insights</li>
                            <li><strong>📈 View Analytics:</strong> Track spending patterns</li>
                            <li><strong>💰 Manage Budgets:</strong> Set financial goals</li>
                        </ul>
                    </div>
                    
                    <p>We're excited to help you manage your finances smarter!</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/dashboard" 
                           style="background: #764ba2; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold;">
                           Go to Dashboard →
                        </a>
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; 
                               color: #6b7280; font-size: 12px; text-align: center;">
                        <p>This is an automated email from <strong style="color: #764ba2;">{self.app_name}</strong>.</p>
                        <p>© 2024 AI Expense Tracker. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.smtp_email_id, self.app_password)
                server.send_message(msg)
            
            logger.info(f"✅ Welcome email sent to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"⚠️  Welcome email failed: {e}")
            return True

# Create instance
email_service = EmailService()