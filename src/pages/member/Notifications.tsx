
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BookOpen, CreditCard, Clock, Check, Trash2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'reservation' | 'due' | 'overdue' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real app, you would fetch from your API
        // For demo, we'll use some sample data
        const sampleNotifications: Notification[] = [
          {
            id: "1",
            type: 'reservation',
            title: "Book Ready for Pickup",
            message: "Your reserved book 'The Catcher in the Rye' is now available for pickup. Please collect it within 3 days.",
            date: "2025-04-01T10:30:00",
            read: false,
          },
          {
            id: "2",
            type: 'due',
            title: "Payment Due Reminder",
            message: "You have an upcoming payment of $25.00 for your annual membership renewal due by May 1st.",
            date: "2025-03-28T15:45:00",
            read: true,
          },
          {
            id: "3",
            type: 'overdue',
            title: "Book Overdue Notice",
            message: "Your book '1984' was due on March 25th. Please return it as soon as possible to avoid additional fees.",
            date: "2025-03-26T09:15:00",
            read: false,
          },
          {
            id: "4",
            type: 'system',
            title: "Library Holiday Hours",
            message: "Please note that the library will have modified hours during the upcoming holiday. We will be closed on April 15th.",
            date: "2025-03-20T11:00:00",
            read: true,
          },
        ];
        
        setNotifications(sampleNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted successfully.",
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reservation':
        return <BookOpen className="h-5 w-5" />;
      case 'due':
        return <CreditCard className="h-5 w-5" />;
      case 'overdue':
        return <Clock className="h-5 w-5" />;
      case 'system':
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reservation':
        return "bg-green-500";
      case 'due':
        return "bg-blue-500";
      case 'overdue':
        return "bg-red-500";
      case 'system':
        return "bg-purple-500";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with your library account</p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don't have any notifications at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all ${notification.read ? '' : 'border-l-4 border-primary'}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getNotificationColor(notification.type)} text-white`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(notification.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-primary">New</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{notification.message}</p>
                      <div className="flex justify-end mt-4 space-x-2">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Mark as read
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MemberLayout>
  );
}
