import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User, GitBranch, Server } from 'lucide-react';
import { startChat, sendMessage } from '@/services/gemini';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface AliceChatBotProps {
  onDeploy: (branch: string, environment: string) => void;
}

const AVAILABLE_BRANCHES = [
  'main',
  'develop',
  'feature-auth',
  'feature-dashboard',
  'fix-payment-bug',
  'hotfix-security'
];

const AVAILABLE_ENVIRONMENTS = [
  ...Array.from({ length: 14 }, (_, i) => `staging-${i + 1}`),
  'ubt'
];

const INITIAL_PROMPT = `Hi there! I'm Alice, your deployment assistant! 👋

I can help you deploy code to our staging environments. You can:
• Deploy a branch to a staging environment
• Ask about available branches
• Ask about staging environments

What would you like to do?`;

const AliceChatBot: React.FC<AliceChatBotProps> = ({ onDeploy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: INITIAL_PROMPT,
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Show available branches', 'Show staging environments', 'Help me deploy']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log('Initializing chat...');
        const session = await startChat();
        console.log('Chat session created successfully');
        setChatSession(session);
      } catch (error) {
        console.error('Error initializing chat:', error);
        addMessage(`Error initializing chat: ${error.message}`, false);
      }
    };
    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, suggestions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    addMessage(suggestion, true);
    setIsTyping(true);

    let response = '';
    let nextSuggestions: string[] = [];

    // Handle branch selection
    if (AVAILABLE_BRANCHES.includes(suggestion)) {
      setSelectedBranch(suggestion);
      response = `Great! You've selected the branch '${suggestion}'. Now, which environment should we deploy to?`;
      nextSuggestions = AVAILABLE_ENVIRONMENTS;
    }
    // Handle environment selection
    else if (AVAILABLE_ENVIRONMENTS.includes(suggestion) && selectedBranch) {
      setSelectedEnvironment(suggestion);
      response = `Perfect! I'm setting up the deployment of '${selectedBranch}' to '${suggestion}'. Click the Deploy button when you're ready! 🚀`;
      nextSuggestions = ['Start new deployment'];
      onDeploy(selectedBranch, suggestion);
      // Reset selections after deployment is set up
      setSelectedBranch(null);
      setSelectedEnvironment(null);
    }
    // Handle command suggestions
    else {
      switch (suggestion.toLowerCase()) {
        case 'show available branches':
          response = `Here are the available branches:\n\n${AVAILABLE_BRANCHES.map(branch => `• ${branch}`).join('\n')}`;
          nextSuggestions = [...AVAILABLE_BRANCHES, 'Show staging environments'];
          break;
        case 'show staging environments':
          response = `Here are the available environments:\n\n${AVAILABLE_ENVIRONMENTS.map(env => `• ${env}`).join('\n')}`;
          nextSuggestions = ['Help me deploy', 'Show available branches'];
          break;
        case 'help me deploy':
          response = "Let's start the deployment process! Which branch would you like to deploy?";
          nextSuggestions = AVAILABLE_BRANCHES;
          break;
        case 'start new deployment':
          response = "Let's start a new deployment! Which branch would you like to deploy?";
          nextSuggestions = AVAILABLE_BRANCHES;
          setSelectedBranch(null);
          setSelectedEnvironment(null);
          break;
        default:
          response = "I'm not sure what you'd like to do. Would you like to see the available branches or environments?";
          nextSuggestions = ['Show available branches', 'Show staging environments', 'Help me deploy'];
      }
    }

    setTimeout(() => {
      addMessage(response, false, nextSuggestions);
      setIsTyping(false);
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, true);
    setInputText('');
    setIsTyping(true);

    try {
      // Get response from Gemini with context about deployment
      const contextMessage = `You are Alice, a deployment assistant. You can only help with deployments and must stay focused on that. 
Current state: ${selectedBranch ? `Selected branch: ${selectedBranch}` : 'No branch selected'}
${selectedEnvironment ? `Selected environment: ${selectedEnvironment}` : 'No environment selected'}
Available branches: ${AVAILABLE_BRANCHES.join(', ')}
Available environments: ${AVAILABLE_ENVIRONMENTS.join(', ')}

User message: ${userMessage}

Respond naturally but keep the focus on deployments. If they ask about anything not related to deployments, branches, or environments, politely redirect them to deployment-related topics.`;

      const response = await sendMessage(chatSession, contextMessage);
      let suggestions = ['Show available branches', 'Show staging environments', 'Help me deploy'];
      
      // If we're in the middle of a deployment flow, show relevant suggestions
      if (selectedBranch && !selectedEnvironment) {
        suggestions = AVAILABLE_ENVIRONMENTS;
      } else if (!selectedBranch) {
        suggestions = [...suggestions, ...AVAILABLE_BRANCHES];
      }
      
      addMessage(response, false, suggestions);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = error.message || "Unknown error occurred";
      addMessage(`I apologize, but I encountered an error: ${errorMessage}. Please try again.`, false, 
        ['Show available branches', 'Show staging environments', 'Help me deploy']);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[32rem] shadow-2xl border-0 bg-zinc-900/95 backdrop-blur-sm z-50 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 bg-primary text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/mukuru-logo.png" 
                  alt="Mukuru" 
                  className="h-8 object-contain brightness-0 invert"
                />
                <div>
                  <CardTitle className="text-lg">Alice</CardTitle>
                  <p className="text-sm text-white/80">Your AI Deployment Assistant</p>
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

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  <div className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isUser && (
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-zinc-800 text-gray-100 rounded-br-none'
                          : 'bg-zinc-800 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-gray-400' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-11">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {AVAILABLE_BRANCHES.includes(suggestion) ? (
                            <GitBranch className="h-3 w-3 mr-1" />
                          ) : AVAILABLE_ENVIRONMENTS.includes(suggestion) ? (
                            <Server className="h-3 w-3 mr-1" />
                          ) : null}
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-zinc-800 text-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900 rounded-b-lg flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about deployments..."
                  className="flex-1 border-2 border-zinc-800 bg-zinc-900 text-gray-300 focus:border-primary placeholder:text-gray-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || !chatSession}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Try: "Show me available branches"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export { AliceChatBot };
