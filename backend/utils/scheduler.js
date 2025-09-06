const cron = require('node-cron');
const Task = require('../models/Task');
const { onDueDateReminder } = require('../controllers/notificationController');

// Run every day at 9 AM
const scheduleDueDateReminders = () => {
    cron.schedule('0 9 * * *', async () => {
        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find tasks due today or tomorrow
            const tasks = await Task.find({
                dueDate: { $gte: now, $lte: tomorrow },
                status: { $ne: 'done' },
                assignee: { $exists: true, $ne: null }
            }).populate('assignee');

            // Send notifications
            for (const task of tasks) {
                const isOverdue = task.dueDate < now;
                await onDueDateReminder(task, task.assignee._id, isOverdue);
            }

            console.log(`Sent ${tasks.length} due date reminders`);
        } catch (error) {
            console.error('Error in due date reminder job:', error);
        }
    });
};

module.exports = { scheduleDueDateReminders };
