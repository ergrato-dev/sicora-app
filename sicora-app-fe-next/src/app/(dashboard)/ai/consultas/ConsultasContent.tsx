'use client';

/**
 * Página de Consultas IA - AIService
 * Chat con asistente de inteligencia artificial
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  MessageSquare,
  Trash2,
  Plus,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Lightbulb,
  BarChart3,
  Clock,
  History,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { useAIStore, selectCurrentMessages } from '@/stores/aiStore';
import type { ChatMessage, ChatSession } from '@/types/ai.types';
import { SUGGESTED_QUERIES, QUICK_ACTIONS } from '@/types/ai.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: '¡Hola! Soy el asistente de SICORA. Puedo ayudarte con análisis de asistencia, identificación de estudiantes en riesgo, recomendaciones de mejora y mucho más. ¿En qué puedo ayudarte hoy?',
    timestamp: '2026-01-08T09:00:00Z',
  },
];

const demoSessions: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Análisis de asistencia enero',
    messages: [],
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-01-08T09:30:00Z',
  },
  {
    id: 'session-2',
    title: 'Estudiantes en riesgo ADSO',
    messages: [],
    createdAt: '2026-01-07T14:00:00Z',
    updatedAt: '2026-01-07T15:00:00Z',
  },
  {
    id: 'session-3',
    title: 'Recomendaciones grupo 2024',
    messages: [],
    createdAt: '2026-01-06T10:00:00Z',
    updatedAt: '2026-01-06T11:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-green-600' : 'bg-gradient-to-br from-purple-500 to-blue-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-green-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-green-200' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
}

function SuggestionChip({ text, onClick }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all text-left"
    >
      {text}
    </button>
  );
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
    >
      <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
        {icon}
      </div>
      <span className="text-xs text-gray-600 text-center">{label}</span>
    </button>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
        isActive ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
        <span className="text-sm truncate">{session.title}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ConsultasContent() {
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [sessions, setSessions] = useState<ChatSession[]>(demoSessions);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isServiceAvailable, checkServiceStatus } = useAIStore();

  useEffect(() => {
    checkServiceStatus();
  }, [checkServiceStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular respuesta del asistente
    setTimeout(() => {
      const responses: Record<string, string> = {
        riesgo: `📊 **Análisis de Estudiantes en Riesgo**\n\nHe identificado **12 estudiantes** con alto riesgo de deserción:\n\n1. **Juan Pérez** (ADSO-2024-01) - Riesgo: 85%\n   - Asistencia: 45% (crítico)\n   - Último acceso: hace 5 días\n\n2. **María García** (DATOS-2024-02) - Riesgo: 78%\n   - Asistencia: 52%\n   - Bajo rendimiento en evaluaciones\n\n3. **Carlos López** (CONT-2024-01) - Riesgo: 72%\n   - Asistencia: 58%\n   - Múltiples justificaciones\n\n💡 **Recomendación:** Contactar a estos estudiantes esta semana y programar tutorías de seguimiento.`,
        asistencia: `📈 **Reporte de Asistencia - Enero 2026**\n\n**Resumen General:**\n- Asistencia promedio: 78.5%\n- Tendencia: ↓ 2.3% vs mes anterior\n\n**Por Programa:**\n- ADSO: 82% ✅\n- Análisis de Datos: 76% ⚠️\n- Contabilidad: 74% ⚠️\n\n**Días críticos:**\n- Lunes: 71% (más bajo)\n- Viernes: 73%\n\n**Acciones sugeridas:**\n1. Investigar causas de ausentismo los lunes\n2. Implementar actividades motivacionales\n3. Revisar horarios de grupos con baja asistencia`,
        recomendaciones: `💡 **Recomendaciones de Mejora**\n\n**Prioridad Alta:**\n1. 🎯 Implementar tutorías personalizadas para 12 estudiantes en riesgo\n2. 📅 Ajustar horario del grupo DATOS-2024-02 (conflicto detectado)\n\n**Prioridad Media:**\n3. 📊 Crear sistema de alertas tempranas para asistencia < 70%\n4. 🤝 Establecer programa de mentorías entre estudiantes\n\n**Prioridad Baja:**\n5. 📱 Mejorar comunicación vía app móvil\n6. 🏆 Implementar sistema de reconocimientos\n\n¿Deseas que profundice en alguna de estas recomendaciones?`,
      };

      let response = `Entendido. He analizado tu consulta sobre "${userMessage.content}".\n\nPuedo ver que te interesa obtener información sobre el sistema. ¿Podrías ser más específico? Puedo ayudarte con:\n\n• Análisis de asistencia\n• Estudiantes en riesgo\n• Recomendaciones de mejora\n• Tendencias y predicciones\n• Optimización de horarios`;

      if (userMessage.content.toLowerCase().includes('riesgo')) {
        response = responses.riesgo;
      } else if (userMessage.content.toLowerCase().includes('asistencia')) {
        response = responses.asistencia;
      } else if (userMessage.content.toLowerCase().includes('recomend')) {
        response = responses.recomendaciones;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: 1200,
          model: 'sicora-ai-v1',
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleQuickAction = (actionId: string) => {
    const actions: Record<string, string> = {
      'risk-analysis': '¿Cuáles estudiantes tienen mayor riesgo de deserción?',
      'attendance-report': 'Muéstrame el análisis de asistencia del último mes',
      recommendations: 'Recomienda acciones para mejorar la asistencia',
      predictions: '¿Cuáles son las predicciones de asistencia para la próxima semana?',
    };
    setInputValue(actions[actionId] || '');
    inputRef.current?.focus();
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages(demoMessages);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva conversación
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
              <History className="w-3 h-3" />
              Conversaciones recientes
            </h3>
            <div className="space-y-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === currentSessionId}
                  onClick={() => setCurrentSessionId(session.id)}
                  onDelete={() => setSessions((prev) => prev.filter((s) => s.id !== session.id))}
                />
              ))}
            </div>
          </div>

          {/* Service Status */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isServiceAvailable ? 'IA disponible' : 'IA no disponible'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Asistente SICORA</h1>
              <p className="text-xs text-gray-500">Análisis inteligente y recomendaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 1 ? (
            // Empty state with quick actions
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ¿En qué puedo ayudarte?
                </h2>
                <p className="text-gray-500">
                  Selecciona una acción rápida o escribe tu consulta
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickActionButton
                  icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
                  label="Estudiantes en riesgo"
                  onClick={() => handleQuickAction('risk-analysis')}
                />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5 text-blue-600" />}
                  label="Reporte asistencia"
                  onClick={() => handleQuickAction('attendance-report')}
                />
                <QuickActionButton
                  icon={<Lightbulb className="w-5 h-5 text-yellow-600" />}
                  label="Recomendaciones"
                  onClick={() => handleQuickAction('recommendations')}
                />
                <QuickActionButton
                  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                  label="Predicciones"
                  onClick={() => handleQuickAction('predictions')}
                />
              </div>

              {/* Suggestions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sugerencias</h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.slice(0, 4).map((query) => (
                    <SuggestionChip
                      key={query}
                      text={query}
                      onClick={() => handleSuggestionClick(query)}
                    />
                  ))}
                </div>
              </div>

              {/* First message */}
              <div className="mt-8">
                <MessageBubble message={messages[0]} />
              </div>
            </div>
          ) : (
            // Messages list
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu consulta..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              SICORA AI puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
