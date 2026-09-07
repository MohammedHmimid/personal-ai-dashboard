from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# --- Auth / User -------------------------------------------------------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    theme: str
    created_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    theme: Optional[Literal["light", "dark", "system"]] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Tags / Categories ---------------------------------------------------

class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    color: str


# --- Notes ---------------------------------------------------------------

class NoteBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = ""
    category_id: Optional[int] = None
    tags: list[str] = []


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[list[str]] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    is_favorite: bool
    is_archived: bool
    category: Optional[CategoryOut] = None
    tags: list[TagOut] = []
    created_at: datetime
    updated_at: datetime


# --- Tasks -----------------------------------------------------------------

TaskStatus = Literal["todo", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    status: TaskStatus = "todo"
    priority: TaskPriority = "medium"
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    tags: list[str] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    tags: Optional[list[str]] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime] = None
    category: Optional[CategoryOut] = None
    tags: list[TagOut] = []
    created_at: datetime
    updated_at: datetime


# --- Goals -------------------------------------------------------------

GoalStatus = Literal["active", "completed", "archived"]


class GoalBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    progress: int = Field(default=0, ge=0, le=100)
    deadline: Optional[datetime] = None
    status: GoalStatus = "active"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    deadline: Optional[datetime] = None
    status: Optional[GoalStatus] = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    progress: int
    deadline: Optional[datetime] = None
    status: GoalStatus
    created_at: datetime
    updated_at: datetime


# --- Dashboard / Analytics ---------------------------------------------

class DashboardSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    tasks_change_pct: float
    total_notes: int
    active_goals: int
    avg_goal_progress: float
    productivity: list[dict]
    recent_notes: list[NoteOut]
    today_tasks: list[TaskOut]


# --- AI Assistant --------------------------------------------------------

class ChatMessageIn(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=8000)


class ChatMessageOut(BaseModel):
    conversation_id: int
    reply: str
    provider: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    content: str
    created_at: datetime


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ConversationDetailOut(ConversationOut):
    messages: list[MessageOut] = []
