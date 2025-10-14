import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadMessages(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history",
      });
    } else if (data) {
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.timestamp,
      })));
    }
  };

  const handleToggleRecording = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Speech recognition is not supported in this browser.",
        });
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => {
      setIsRecording(false);
      sendMessage();
    };
    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Speech synthesis is not supported in this browser.",
        });
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceOutput = () => {
    setVoiceOutput(prev => !prev);
    if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: userMessage.content,
    });

    try {
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: { message: userMessage.content, userId: user.id },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (voiceOutput) {
        speak(assistantMessage.content);
      }

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: assistantMessage.content,
        crisis_flag: data.crisisDetected || false,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from AI",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">AI Companion</h1>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                Welcome! I'm here to listen and support you. How are you feeling today?
              </p>
            </Card>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <Button type="button" size="icon" variant="ghost" onClick={handleToggleRecording} aria-label="Toggle recording">
                <Mic className={`w-5 h-5 ${isRecording ? "text-red-500" : ""}`} />
            </Button>
            <Button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={handleToggleVoiceOutput} aria-label="Toggle voice output">
                <Volume2 className={`w-5 h-5 ${voiceOutput ? "text-blue-500" : ""}`} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
