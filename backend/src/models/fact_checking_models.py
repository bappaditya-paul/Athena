from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base

class SourceType(PyEnum):
    FACT_CHECKING_ORG = "fact_checking_org"
    NEWS_OUTLET = "news_outlet"
    GOVERNMENT = "government"
    ACADEMIC = "academic"
    OTHER = "other"

class ContentType(PyEnum):
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"
    WEB_SCRIPT = "web_script"

class VerificationStatus(PyEnum):
    TRUE = "true"
    FALSE = "false"
    MISLEADING = "misleading"
    UNVERIFIED = "unverified"
    PARTIALLY_TRUE = "partially_true"

class CredibleSource(Base):
    __tablename__ = "credible_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    domain = Column(String(255), nullable=False, unique=True)
    source_type = Column(Enum(SourceType), nullable=False)
    credibility_score = Column(Float, default=1.0)  # 0.0 to 1.0
    description = Column(Text, nullable=True)
    last_verified = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    verifications = relationship("VerifiedFact", back_populates="source")

class UserQuery(Base):
    __tablename__ = "user_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    original_format = Column(String(50), nullable=True)  # e.g., mp3, mp4, txt, etc.
    submitted_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String(255), nullable=True)  # Can be null for anonymous queries
    
    # Relationships
    verifications = relationship("VerifiedFact", back_populates="query")

class VerifiedFact(Base):
    __tablename__ = "verified_facts"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("user_queries.id"))
    source_id = Column(Integer, ForeignKey("credible_sources.id"))
    status = Column(Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    summary = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)  # 0.0 to 1.0
    verified_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    query = relationship("UserQuery", back_populates="verifications")
    source = relationship("CredibleSource", back_populates="verifications")

class ExternalSource(Base):
    __tablename__ = "external_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(512), nullable=False, unique=True)
    domain = Column(String(255), nullable=False, index=True)
    title = Column(String(512), nullable=True)
    content = Column(Text, nullable=True)
    content_type = Column(String(100), nullable=True)
    credibility_score = Column(Float, default=0.0)  # 0.0 to 1.0
    last_checked = Column(DateTime, default=datetime.utcnow)
    is_whitelisted = Column(Boolean, default=False)
    
    # For potential promotion to credible sources
    suggested_source_name = Column(String(255), nullable=True)
    suggested_source_type = Column(Enum(SourceType), nullable=True)
    suggested_by = Column(String(255), nullable=True)  # Could be user_id or 'system'
    suggestion_date = Column(DateTime, nullable=True)
