import logging
import json
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
def setup_logger(name: str, log_file: str = "app.log", level=logging.INFO):
    """Setup logger with file and console handlers"""
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler
    file_handler = logging.FileHandler(LOG_DIR / log_file)
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Create loggers for different modules
auth_logger = setup_logger("auth", "auth.log")
security_logger = setup_logger("security", "security.log", logging.WARNING)
audit_logger = setup_logger("audit", "audit.log")
user_logger = setup_logger("user_crud", "user_crud.log")  # NEW: User CRUD logger

def log_auth_event(
    event_type: str,
    email: str,
    status: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
):
    """Log authentication events"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "email": email,
        "status": status,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "details": details or {},
        "error": error
    }
    
    if status == "SUCCESS":
        auth_logger.info(json.dumps(log_entry))
    else:
        auth_logger.warning(json.dumps(log_entry))

def log_security_event(
    event_type: str,
    email: str,
    severity: str,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """Log security events (suspicious activities)"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "email": email,
        "severity": severity,
        "ip_address": ip_address,
        "details": details or {}
    }
    
    if severity in ["CRITICAL", "HIGH"]:
        security_logger.critical(json.dumps(log_entry))
    elif severity == "MEDIUM":
        security_logger.warning(json.dumps(log_entry))
    else:
        security_logger.info(json.dumps(log_entry))

def log_audit_event(
    user_id: str,
    email: str,
    action: str,
    resource: str,
    details: Optional[Dict[str, Any]] = None,
    status: str = "SUCCESS"
):
    """Log audit events for compliance"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "email": email,
        "action": action,
        "resource": resource,
        "status": status,
        "details": details or {}
    }
    audit_logger.info(json.dumps(log_entry))


# ============ NEW: User CRUD Logging Functions ============

def log_user_event(
    event_type: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    status: str = "SUCCESS",
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
    admin_id: Optional[str] = None
):
    """
    Log user management events (CRUD operations)
    
    Event Types:
    - USER_LIST_ACCESS: User viewed user list
    - USER_GET: Single user viewed
    - USER_CREATE: New user created
    - USER_UPDATE: User updated
    - USER_DELETE: User deleted
    - TOKEN_GENERATED: Token generated
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "email": email,
        "status": status,
        "ip_address": ip_address,
        "admin_id": admin_id,
        "details": details or {},
        "error": error
    }
    
    if status == "SUCCESS":
        user_logger.info(json.dumps(log_entry))
    else:
        user_logger.warning(json.dumps(log_entry))


# ============ Optional: Document Activity Logging ============

def log_document_event(
    event_type: str,
    document_id: str,
    document_title: str,
    user_id: str,
    email: str,
    action: str,
    status: str = "SUCCESS",
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
):
    """
    Log document management events
    
    Event Types:
    - DOCUMENT_UPLOAD: Document uploaded
    - DOCUMENT_VIEW: Document viewed
    - DOCUMENT_DOWNLOAD: Document downloaded
    - DOCUMENT_RENAME: Document renamed
    - DOCUMENT_MOVE: Document moved
    - DOCUMENT_DELETE: Document deleted
    - DOCUMENT_RESTORE: Document restored
    - DOCUMENT_FAVORITE: Document favorited
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "document_id": document_id,
        "document_title": document_title,
        "user_id": user_id,
        "email": email,
        "action": action,
        "status": status,
        "ip_address": ip_address,
        "details": details or {},
        "error": error
    }
    
    # Use document logger (create if needed)
    doc_logger = setup_logger("documents", "documents.log")
    if status == "SUCCESS":
        doc_logger.info(json.dumps(log_entry))
    else:
        doc_logger.warning(json.dumps(log_entry))


# ============ Helper to get client info from request ============

def get_client_info(request):
    """Extract client IP and user agent from request"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    return client_ip, user_agent