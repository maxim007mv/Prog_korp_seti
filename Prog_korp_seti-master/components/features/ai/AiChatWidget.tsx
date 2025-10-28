'use client';

import { useState, useRef, useEffect } from 'react';
import { useAiChat } from '@/lib/hooks';
import { Button, Input } from '@/components/ui';
import { MessageCircle, Send, X, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я ИИ-ассистент ресторана. Могу помочь с аналитикой, прогнозами и рекомендациями. Чем могу помочь?',
      timestamp: new Date(),
      suggestions: [
        'Покажи топ блюд за сегодня',
        'Какой прогноз на завтра?',
        'Дай рекомендации по меню',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = useAiChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        context: 'general',
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition flex items-center justify-center z-50 group"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Спросить ИИ-ассистента
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-accent to-accent/80 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold">ИИ-Ассистент</span>
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Онлайн</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-accent" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div
                          className={`rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-accent text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        <p className="text-xs mt-1 opacity-70 px-1">
                          {msg.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {/* Suggestions */}
                        {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition flex items-center gap-1"
                              >
                                <Sparkles className="h-3 w-3 text-accent" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2 mb-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос..."
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  size="sm"
                  className="px-3"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <QuickActionButton
                  icon={<Sparkles className="h-3 w-3" />}
                  label="Топ блюд"
                  onClick={() => setInput('Покажи топ блюд за сегодня')}
                />
                <QuickActionButton
                  icon={<Sparkles className="h-3 w-3" />}
                  label="Прогноз"
                  onClick={() => setInput('Какой прогноз на завтра?')}
                />
                <QuickActionButton
                  icon={<Sparkles className="h-3 w-3" />}
                  label="Рекомендации"
                  onClick={() => setInput('Дай рекомендации по меню')}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Quick action button
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition flex items-center gap-1 whitespace-nowrap"
    >
      {icon}
      {label}
    </button>
  );
}
