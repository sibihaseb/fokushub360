import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Users, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  messageType: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'normal'
  });

  useEffect(() => {
    fetchMessages();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchParticipants();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await apiRequest("GET", "/api/messages");
      setMessages(response);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await apiRequest("GET", "/api/manager/participants");
      setParticipants(response);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await apiRequest("POST", "/api/messages/send", {
        recipientId: parseInt(newMessage.recipientId),
        subject: newMessage.subject,
        content: newMessage.content,
        messageType: newMessage.messageType,
        priority: newMessage.priority
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });

      setNewMessage({
        recipientId: '',
        subject: '',
        content: '',
        messageType: 'general',
        priority: 'normal'
      });
      setShowCompose(false);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiRequest("POST", `/api/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'system': return <CheckCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-emerald-500" />
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Button 
            onClick={() => setShowCompose(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Compose Message
          </Button>
        )}
      </div>

      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Send a message to a participant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={newMessage.recipientId} onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map(participant => (
                      <SelectItem key={participant.id} value={participant.id.toString()}>
                        {participant.firstName} {participant.lastName} ({participant.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newMessage.priority} onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select value={newMessage.messageType} onValueChange={(value) => setNewMessage(prev => ({ ...prev, messageType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="campaign_invite">Campaign Invitation</SelectItem>
                  <SelectItem value="system">System Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCompose(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button 
                onClick={sendMessage}
                disabled={sending}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Messages</CardTitle>
          <CardDescription>
            {messages.length === 0 ? "No messages yet" : `${messages.length} message(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`p-4 border rounded-lg ${message.isRead ? 'bg-gray-50' : 'bg-white border-emerald-200'}`}
                  onClick={() => !message.isRead && markAsRead(message.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getMessageTypeIcon(message.messageType)}
                      <h3 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                        {message.subject}
                      </h3>
                      {!message.isRead && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{message.content}</p>
                  {message.sender && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>From: {message.sender.firstName} {message.sender.lastName} ({message.sender.role})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}