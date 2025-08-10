#!/usr/bin/env node

// Debug script to recalculate Mary Mazur's questionnaire completion and fix dashboard data

import { db } from './server/db.js';
import { users, participantResponses, questions } from './shared/schema.js';
import { eq, count } from 'drizzle-orm';

async function recalculateQuestionnaireCompletion() {
  try {
    console.log('🔍 Debugging Mary Mazur\'s questionnaire completion...');
    
    // Get Mary Mazur's user record
    const maryUser = await db.select().from(users).where(eq(users.email, 'marymazur2@gmail.com'));
    if (!maryUser.length) {
      console.log('❌ Mary Mazur not found');
      return;
    }
    
    const mary = maryUser[0];
    console.log(`👤 Found Mary Mazur (ID: ${mary.id})`);
    console.log(`   Current completion: ${mary.questionnaire_completed}`);
    console.log(`   Current percentage: ${mary.questionnaire_completion_percentage}%`);
    
    // Count total questions
    const totalQuestionsResult = await db.select({ count: count() }).from(questions);
    const totalQuestions = totalQuestionsResult[0].count;
    console.log(`📝 Total questions: ${totalQuestions}`);
    
    // Count Mary's responses
    const maryResponsesResult = await db.select({ count: count() }).from(participantResponses).where(eq(participantResponses.user_id, mary.id));
    const maryResponses = maryResponsesResult[0].count;
    console.log(`✅ Mary's responses: ${maryResponses}`);
    
    // Calculate completion percentage
    const completionPercentage = totalQuestions > 0 ? Math.round((maryResponses / totalQuestions) * 100) : 0;
    const shouldBeCompleted = completionPercentage >= 80;
    
    console.log(`📊 Calculated completion: ${completionPercentage}%`);
    console.log(`🎯 Should be marked as completed: ${shouldBeCompleted}`);
    
    // Fix Mary's completion status
    await db.update(users)
      .set({
        questionnaire_completed: shouldBeCompleted,
        questionnaire_completion_percentage: completionPercentage,
        questionnaire_health_status: completionPercentage >= 90 ? 'excellent' : 
                                      completionPercentage >= 75 ? 'great' :
                                      completionPercentage >= 50 ? 'good' :
                                      completionPercentage >= 25 ? 'fair' : 'poor',
        updated_at: new Date()
      })
      .where(eq(users.id, mary.id));
    
    console.log('✅ Updated Mary\'s questionnaire completion status');
    
    // Get updated record to verify
    const updatedMary = await db.select().from(users).where(eq(users.id, mary.id));
    const updated = updatedMary[0];
    console.log(`🔄 Updated status:`);
    console.log(`   Completed: ${updated.questionnaire_completed}`);
    console.log(`   Percentage: ${updated.questionnaire_completion_percentage}%`);
    console.log(`   Health: ${updated.questionnaire_health_status}`);
    
    console.log('✅ Dashboard data should now be correctly synchronized');
    
  } catch (error) {
    console.error('❌ Error recalculating questionnaire completion:', error);
  }
}

// Run the fix
recalculateQuestionnaireCompletion().then(() => {
  console.log('🎉 Dashboard data fix completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});