import { db } from "./db";
import { users, notifications } from "@shared/schema";
import { eq, and, lt, ne } from "drizzle-orm";

export interface VerificationStatus {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationLevel: 'unverified' | 'pending' | 'verified' | 'premium';
  lastReminderSent: Date | null;
  reminderCount: number;
  joinedDate: Date;
  lastLogin: Date | null;
  profileCompleteness: number;
  campaignParticipation: number;
}

export interface VerificationReminder {
  userId: string;
  reminderType: 'email_verification' | 'document_upload' | 'profile_completion' | 'priority_benefits';
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastSent: Date | null;
  nextScheduled: Date | null;
}

export class VerificationSystem {
  
  // Get verification statistics for admin dashboard
  async getVerificationStats() {
    try {
      const allUsers = await db.select().from(users);
      
      const stats = {
        totalUsers: allUsers.length,
        verifiedUsers: allUsers.filter(u => u.isVerified).length,
        unverifiedUsers: allUsers.filter(u => !u.isVerified).length,
        pendingVerification: allUsers.filter(u => u.verificationStatus === 'pending').length,
        verificationRate: allUsers.length > 0 ? (allUsers.filter(u => u.isVerified).length / allUsers.length) * 100 : 0,
        recentSignups: allUsers.filter(u => {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return u.createdAt && new Date(u.createdAt) > sevenDaysAgo;
        }).length,
        highPriorityUnverified: allUsers.filter(u => 
          !u.isVerified && u.role === 'participant' && u.createdAt && 
          new Date(u.createdAt) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        ).length
      };
      
      return stats;
    } catch (error) {
      console.error("Error getting verification stats:", error);
      throw error;
    }
  }

  // Get unverified users for admin management
  async getUnverifiedUsers(limit: number = 50) {
    try {
      const unverifiedUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        isVerified: users.isVerified,
        verificationStatus: users.verificationStatus,
        reminderCount: users.reminderCount,
        lastReminderSent: users.lastReminderSent
      })
      .from(users)
      .where(eq(users.isVerified, false))
      .limit(limit);
      
      return unverifiedUsers.map(user => ({
        ...user,
        daysSinceJoined: user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        reminderStatus: this.getReminderStatus(user.reminderCount || 0, user.lastReminderSent),
        priorityLevel: this.calculatePriorityLevel(user)
      }));
    } catch (error) {
      console.error("Error getting unverified users:", error);
      throw error;
    }
  }

  // Get verified users for admin management
  async getVerifiedUsers(limit: number = 50) {
    try {
      const verifiedUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        isVerified: users.isVerified,
        verificationStatus: users.verificationStatus,
        verificationDate: users.verificationDate
      })
      .from(users)
      .where(eq(users.isVerified, true))
      .limit(limit);
      
      return verifiedUsers.map(user => ({
        ...user,
        daysSinceVerified: user.verificationDate ? Math.floor((Date.now() - new Date(user.verificationDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        verificationLevel: user.verificationStatus || 'verified'
      }));
    } catch (error) {
      console.error("Error getting verified users:", error);
      throw error;
    }
  }

  // Update user verification status
  async updateVerificationStatus(userId: string, status: 'verified' | 'pending' | 'rejected', adminId: string) {
    try {
      const updateData: any = {
        verificationStatus: status,
        verificationDate: status === 'verified' ? new Date() : null,
        isVerified: status === 'verified',
        verifiedBy: status === 'verified' ? adminId : null
      };

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      // Create notification for user
      await db.insert(notifications).values({
        userId: userId,
        type: 'verification_update',
        title: status === 'verified' ? 'Account Verified!' : 
               status === 'pending' ? 'Verification Pending' : 'Verification Rejected',
        message: this.getVerificationMessage(status),
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });

      return { success: true, status };
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
  }

  // Send verification reminders
  async sendVerificationReminders(userIds: string[] = [], adminId: string) {
    try {
      let targetUsers;
      
      if (userIds.length > 0) {
        // Send to specific users
        targetUsers = await db.select().from(users).where(
          and(
            eq(users.isVerified, false),
            // Add condition for userIds - this would need to be implemented with OR conditions
          )
        );
      } else {
        // Send to all unverified users who haven't received a reminder in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        targetUsers = await db.select().from(users).where(
          and(
            eq(users.isVerified, false),
            ne(users.role, 'admin'),
            // Only send if last reminder was more than 24 hours ago or never sent
          )
        );
      }

      const remindersSent = [];
      
      for (const user of targetUsers) {
        // Update reminder count and last sent date
        await db.update(users)
          .set({
            reminderCount: (user.reminderCount || 0) + 1,
            lastReminderSent: new Date()
          })
          .where(eq(users.id, user.id));

        // Create reminder notification
        await db.insert(notifications).values({
          userId: user.id,
          type: 'verification_reminder',
          title: 'Verify Your Account for Priority Access',
          message: this.getReminderMessage(user.reminderCount || 0),
          priority: 'high',
          isRead: false,
          createdAt: new Date()
        });

        remindersSent.push({
          userId: user.id,
          email: user.email,
          reminderCount: (user.reminderCount || 0) + 1
        });
      }

      return {
        success: true,
        remindersSent: remindersSent.length,
        users: remindersSent
      };
    } catch (error) {
      console.error("Error sending verification reminders:", error);
      throw error;
    }
  }

  // Priority matching for verified users
  async getPriorityParticipants(campaignId: string, limit: number = 100) {
    try {
      // Get all participants, prioritizing verified users
      const participants = await db.select().from(users).where(
        and(
          eq(users.role, 'participant'),
          eq(users.isActive, true)
        )
      );

      // Sort by verification status and other priority factors
      const prioritized = participants.sort((a, b) => {
        // Verified users get highest priority
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        
        // Among verified users, sort by verification level
        if (a.isVerified && b.isVerified) {
          const levelPriority = { 'premium': 4, 'verified': 3, 'pending': 2, 'unverified': 1 };
          const aLevel = levelPriority[a.verificationStatus as keyof typeof levelPriority] || 1;
          const bLevel = levelPriority[b.verificationStatus as keyof typeof levelPriority] || 1;
          if (aLevel !== bLevel) return bLevel - aLevel;
        }
        
        // Secondary sort by last login (more recent = higher priority)
        if (a.lastLogin && b.lastLogin) {
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
        }
        
        return 0;
      });

      return prioritized.slice(0, limit);
    } catch (error) {
      console.error("Error getting priority participants:", error);
      throw error;
    }
  }

  // Helper methods
  private getReminderStatus(reminderCount: number, lastReminderSent: Date | null): string {
    if (!lastReminderSent) return 'never_sent';
    
    const hoursSinceLastReminder = (Date.now() - new Date(lastReminderSent).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastReminder < 24) return 'recent';
    if (hoursSinceLastReminder < 72) return 'due_soon';
    return 'overdue';
  }

  private calculatePriorityLevel(user: any): 'low' | 'medium' | 'high' | 'urgent' {
    const daysSinceJoined = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const reminderCount = user.reminderCount || 0;
    
    if (daysSinceJoined > 14 && reminderCount < 3) return 'urgent';
    if (daysSinceJoined > 7 && reminderCount < 2) return 'high';
    if (daysSinceJoined > 3) return 'medium';
    return 'low';
  }

  private getVerificationMessage(status: string): string {
    switch (status) {
      case 'verified':
        return 'Congratulations! Your account has been verified. You now have priority access to campaigns and premium features.';
      case 'pending':
        return 'Your verification is being reviewed. We\'ll notify you once the process is complete.';
      case 'rejected':
        return 'Your verification was not approved. Please check your submitted documents and try again.';
      default:
        return 'Your verification status has been updated.';
    }
  }

  private getReminderMessage(reminderCount: number): string {
    const messages = [
      'Welcome to FokusHub360! Verify your account to unlock priority access to high-paying campaigns.',
      'Don\'t miss out! Verified users get first access to premium campaigns with higher rewards.',
      'Your verification is still pending. Complete it now to join exclusive focus groups.',
      'Priority access awaits! Verified participants earn up to 3x more than unverified users.',
      'Last reminder: Complete your verification to access our premium campaign network.'
    ];
    
    return messages[Math.min(reminderCount, messages.length - 1)];
  }
}

export const verificationSystem = new VerificationSystem();