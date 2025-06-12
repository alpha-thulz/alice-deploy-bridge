
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AliceChatBotProps {
  onDeploy: (branch: string, environment: string) => void;
}

const AliceChatBot: React.FC<AliceChatBotProps> = ({ onDeploy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Alice, your friendly deployment assistant! 👋 I can help you deploy your code with simple commands like 'Deploy feature-auth to staging-3' or answer any questions you have. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const parseDeploymentCommand = (text: string) => {
    const deployPattern = /deploy\s+([^\s]+)\s+to\s+([^\s]+)/i;
    const match = text.match(deployPattern);
    
    if (match) {
      const branch = match[1];
      const environment = match[2];
      return { branch, environment };
    }
    return null;
  };

  const generateAliceResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for deployment command
    const deploymentCommand = parseDeploymentCommand(userMessage);
    if (deploymentCommand) {
      onDeploy(deploymentCommand.branch, deploymentCommand.environment);
      return `Perfect! I've set up the deployment for you. I'll deploy ${deploymentCommand.branch} to ${deploymentCommand.environment}. Just click the Deploy button when you're ready! 🚀`;
    }

    // Help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm here to make deployments super easy! You can:\n\n• Tell me 'Deploy [branch-name] to [environment]' and I'll set it up for you\n• Ask about deployment status or history\n• Get help with any deployment questions\n\nTry saying something like 'Deploy main to staging-1' and watch the magic happen! ✨";
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('deployment')) {
      return "Great question! You can check the current deployment status in the Steps tab, and see all deployment history in the Logs tab. Is there a specific deployment you'd like to know about? 📊";
    }

    if (lowerMessage.includes('environment') || lowerMessage.includes('staging')) {
      return "We have staging environments from staging-1 to staging-14, plus a special 'ubt' environment. Each one is ready for your deployments! Which environment would you like to use? 🏗️";
    }

    if (lowerMessage.includes('branch')) {
      return "I can help you deploy any branch! Just tell me which one you'd like to deploy. For example, say 'Deploy feature-auth to staging-3' and I'll get everything ready for you! 🌿";
    }

    if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return "You're so welcome! I'm always happy to help make your deployments smooth and stress-free. Is there anything else you'd like to deploy? 😊";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Great to see you again! Ready to deploy something awesome today? Just let me know what branch and environment you'd like to use! 👋";
    }

    // Default response
    return "I'm not quite sure about that, but I'm always learning! I'm best at helping with deployments - try telling me something like 'Deploy feature-x to staging-2' and I'll set it up for you right away! 🤖";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, true);
    setInputText('');
    setIsTyping(true);

    // Simulate Alice thinking
    setTimeout(() => {
      const response = generateAliceResponse(userMessage);
      addMessage(response, false);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[32rem] shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col">
          <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Alice</CardTitle>
                  <p className="text-sm text-purple-100">Your AI Deployment Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.isUser && (
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Alice to deploy something..."
                  className="flex-1 border-2 border-gray-200 focus:border-purple-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Try: "Deploy feature-auth to staging-3"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export { AliceChatBot };
