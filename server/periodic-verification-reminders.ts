import { storage } from "./storage";
import cron from "node-cron";

export class PeriodicVerificationReminderService {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run daily at 10 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Running periodic verification reminders...');
      await this.sendVerificationReminders();
    });
    
    console.log('Periodic verification reminder service started');
  }

  stop() {
    this.isRunning = false;
    console.log('Periodic verification reminder service stopped');
  }

  async sendVerificationReminders() {
    try {
      const unverifiedUsers = await storage.getUnverifiedUsers();
      let remindersSent = 0;
      
      for (const user of unverifiedUsers) {
        if (user.role === 'participant') {
          const joinedDate = user.createdAt || new Date();
          const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Send reminder logic:
          // - First reminder after 7 days
          // - Weekly reminders thereafter
          // - Stop after 30 days to avoid spam
          if (daysSinceJoined >= 7 && daysSinceJoined <= 30 && daysSinceJoined % 7 === 0) {
            const reminderNumber = Math.floor(daysSinceJoined / 7);
            
            let message;
            let priority = 'normal';
            
            if (daysSinceJoined <= 14) {
              message = `You've been with us for ${daysSinceJoined} days. Complete your verification to access premium campaigns and earn up to 3x more!`;
              priority = 'normal';
            } else if (daysSinceJoined <= 21) {
              message = `Don't miss out! You've been with us for ${daysSinceJoined} days. Complete verification now to unlock premium features and higher earnings.`;
              priority = 'high';
            } else {
              message = `Final reminder: Complete your verification within the next few days to maintain access to premium campaigns and exclusive opportunities.`;
              priority = 'urgent';
            }
            
            await storage.createNotification({
              userId: user.id,
              type: 'verification_reminder',
              title: `Verification Reminder #${reminderNumber}`,
              message,
              data: {
                daysSinceJoined,
                reminderNumber,
                priority,
                reminderType: 'periodic'
              }
            });
            
            remindersSent++;
            console.log(`Sent verification reminder to user ${user.id} (${daysSinceJoined} days since joining)`);
          }
        }
      }
      
      console.log(`Periodic verification reminders complete. Sent ${remindersSent} reminders to ${unverifiedUsers.length} unverified users.`);
      
      return {
        remindersSent,
        totalUnverified: unverifiedUsers.length
      };
    } catch (error) {
      console.error('Error sending periodic verification reminders:', error);
      throw error;
    }
  }

  // Manual trigger for testing
  async sendRemindersNow() {
    console.log('Manually triggering verification reminders...');
    return await this.sendVerificationReminders();
  }
}

export const periodicVerificationService = new PeriodicVerificationReminderService();