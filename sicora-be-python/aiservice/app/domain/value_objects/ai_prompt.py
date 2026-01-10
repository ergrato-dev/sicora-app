"""AI Prompt value object."""

from typing import Dict, Any, Optional, List
from enum import Enum


class PromptType(str, Enum):
    """Types of AI prompts."""

    CHAT = "CHAT"
    COMPLETADO = "COMPLETADO"
    SISTEMA = "SISTEMA"
    INSTRUCCION = "INSTRUCCION"
    CREATIVO = "CREATIVO"
    ANALITICO = "ANALITICO"


class PromptTemplate(str, Enum):
    """Pre-defined prompt templates."""

    ASISTENTE_GENERAL = "ASISTENTE_GENERAL"
    TUTOR_ACADEMICO = "TUTOR_ACADEMICO"
    ASISTENTE_CODIGO = "ASISTENTE_CODIGO"
    COORDINADOR_ONEVISION = "COORDINADOR_ONEVISION"
    SOPORTE_APRENDIZ = "SOPORTE_APRENDIZ"


class AIPrompt:
    """Value object representing an AI prompt."""

    def __init__(
        self,
        content: str,
        prompt_type: PromptType = PromptType.CHAT,
        template: Optional[PromptTemplate] = None,
        variables: Optional[Dict[str, Any]] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        context: Optional[str] = None,
        instructions: Optional[str] = None,
        examples: Optional[List[str]] = None,
        constraints: Optional[List[str]] = None,
    ):
        self.content = content
        self.prompt_type = prompt_type
        self.template = template
        self.variables = variables or {}
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.context = context
        self.instructions = instructions
        self.examples = examples or []
        self.constraints = constraints or []

    def render(self) -> str:
        """Render the prompt with variables."""
        rendered_content = self.content

        # Replace variables in content
        for key, value in self.variables.items():
            placeholder = f"{{{key}}}"
            rendered_content = rendered_content.replace(placeholder, str(value))

        # Add context if present
        if self.context:
            rendered_content = f"Contexto: {self.context}\n\n{rendered_content}"

        # Add instructions if present
        if self.instructions:
            rendered_content = f"{self.instructions}\n\n{rendered_content}"

        return rendered_content

    def add_variable(self, key: str, value: Any) -> None:
        """Add a variable to the prompt."""
        self.variables[key] = value

    def add_example(self, example: str) -> None:
        """Add an example to the prompt."""
        self.examples.append(example)

    def add_constraint(self, constraint: str) -> None:
        """Add a constraint to the prompt."""
        self.constraints.append(constraint)

    def set_context(self, context: str) -> None:
        """Set the context for the prompt."""
        self.context = context

    def set_instructions(self, instructions: str) -> None:
        """Set instructions for the prompt."""
        self.instructions = instructions

    def get_token_estimate(self) -> int:
        """Estimate token count for the prompt."""
        # Simple estimation: ~4 characters per token
        return len(self.render()) // 4

    def to_dict(self) -> Dict[str, Any]:
        """Convert prompt to dictionary."""
        return {
            "content": self.content,
            "prompt_type": self.prompt_type.value,
            "template": self.template.value if self.template else None,
            "variables": self.variables,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "context": self.context,
            "instructions": self.instructions,
            "examples": self.examples,
            "constraints": self.constraints,
            "rendered_content": self.render(),
            "estimated_tokens": self.get_token_estimate(),
        }

    @classmethod
    def from_template(
        cls, template: PromptTemplate, variables: Optional[Dict[str, Any]] = None
    ) -> "AIPrompt":
        """Create prompt from template."""
        templates = {
            PromptTemplate.GENERAL_ASSISTANT: {
                "content": "Eres un asistente útil y conversacional. Responde de manera clara y precisa a las preguntas del usuario.",
                "prompt_type": PromptType.CHAT,
                "instructions": "Mantén un tono profesional pero amigable.",
            },
            PromptTemplate.ACADEMIC_TUTOR: {
                "content": "Eres un tutor académico especializado en {subject}. Ayuda al estudiante a entender {topic}.",
                "prompt_type": PromptType.INSTRUCTION,
                "instructions": "Explica conceptos de manera didáctica y proporciona ejemplos prácticos.",
            },
            PromptTemplate.CODE_ASSISTANT: {
                "content": "Eres un asistente de programación experto en {language}. Ayuda con el siguiente código: {code}",
                "prompt_type": PromptType.ANALYTICAL,
                "instructions": "Revisa el código, identifica errores y sugiere mejoras.",
            },
            PromptTemplate.ONEVISION_COORDINATOR: {
                "content": "Eres un coordinador académico de OneVision especializado en {program}. Asiste con {query}.",
                "prompt_type": PromptType.INSTRUCTION,
                "context": "OneVision - OneVision Open Source, Educational Platform",
                "instructions": "Proporciona información precisa sobre programas, procesos y normativas de OneVision.",
            },
            PromptTemplate.STUDENT_SUPPORT: {
                "content": "Eres un asistente de apoyo estudiantil. Ayuda al estudiante con {issue}.",
                "prompt_type": PromptType.CHAT,
                "instructions": "Mantén un tono empático y proporciona orientación constructiva.",
            },
        }

        template_config = templates.get(
            template, templates[PromptTemplate.GENERAL_ASSISTANT]
        )

        return cls(
            content=template_config["content"],
            prompt_type=PromptType(template_config["prompt_type"]),
            template=template,
            variables=variables or {},
            context=template_config.get("context"),
            instructions=template_config.get("instructions"),
        )

    def __str__(self) -> str:
        return f"AIPrompt(type={self.prompt_type.value}, template={self.template.value if self.template else None})"

    def __repr__(self) -> str:
        return self.__str__()
