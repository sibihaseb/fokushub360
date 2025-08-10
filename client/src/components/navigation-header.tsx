import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu,
  Home,
  BarChart3,
  Users,
  FileText,
  Shield,
  Brain,
  ChevronRight,
  Check,
  Archive,
  Trash2,
  X
} from "lucide-react";
import logoImage from "@assets/FOKUSHUB360_1752707903267.png";

interface NavigationHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function NavigationHeader({ title, breadcrumbs }: NavigationHeaderProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch real notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    retry: false,
  });

  // Notification actions
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest('POST', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest('DELETE', `/api/notifications/${notificationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      setLocation("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'client': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'participant': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="FokusHub360 Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
            
            {/* Breadcrumbs */}
            {breadcrumbs && (
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    {crumb.href ? (
                      <button
                        onClick={() => setLocation(crumb.href!)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-white font-medium">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Center - Title */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
            </div>
          )}

          {/* Right side - User menu and notifications */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search campaigns, participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Handle search
                        console.log('Searching for:', searchTerm);
                        // You can add search logic here
                      }
                      if (e.key === 'Escape') {
                        setShowSearch(false);
                        setSearchTerm("");
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm("");
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSearch(true)}
                  className="text-slate-400 hover:text-white"
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-slate-400 hover:text-white">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 glass-effect border-slate-700 bg-slate-900/95">
                <DropdownMenuLabel className="text-white font-semibold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div key={notification.id} className="p-3 border-b border-slate-700 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.isRead ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-emerald-400"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/50"
                  onClick={() => setLocation("/notifications")}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-800/50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <Badge className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}>
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-effect border-slate-700">
                <DropdownMenuLabel className="text-white">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                
                <DropdownMenuItem 
                  onClick={() => setLocation("/dashboard")}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setLocation("/profile")}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setLocation("/settings")}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={() => setLocation("/admin")}
                      className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}