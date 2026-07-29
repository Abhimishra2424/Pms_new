const cron = require('node-cron');
const { Op, fn, col } = require('sequelize');
const {
  User, Task, Attendance, ActivityLog, TimeEntry,
  Notification, Company, Leave, sequelize,
} = require('../models');
const { notificationService } = require('../services/notificationService');
const logger = require('../utils/logger');

function initCron() {
  cron.schedule('0 9 * * 1', async () => {
    logger.info('[Cron] Starting weekly report generation...');
    try {
      const companies = await Company.findAll({ attributes: ['id', 'name'] });

      for (const company of companies) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const managers = await User.findAll({
          where: { companyId: company.id, role: { [Op.in]: ['company_admin', 'project_manager'] } },
        });

        for (const manager of managers) {
          await notificationService.create(manager.id, {
            title: 'Weekly Report Available',
            message: `Weekly report for ${company.name} (${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}) is now available.`,
            type: 'system',
            referenceType: 'report',
            referenceId: 'weekly',
            companyId: company.id,
          });
        }
      }
      logger.info('[Cron] Weekly report generation completed');
    } catch (error) {
      logger.error('[Cron] Weekly report generation failed:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    logger.info('[Cron] Starting daily task deadline reminders...');
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const tasksDue = await Task.findAll({
        where: {
          dueDate: {
            [Op.between]: [now, tomorrow],
          },
          status: { [Op.notIn]: ['done', 'cancelled'] },
        },
        include: [
          { association: 'assignee', attributes: ['id'] },
          { association: 'project', attributes: ['name'] },
        ],
      });

      for (const task of tasksDue) {
        if (task.assignee) {
          await notificationService.sendPush(
            task.assignee.id,
            'Task Deadline Reminder',
            `Task "${task.title}" is due soon in project ${task.project?.name || 'N/A'}`,
            'deadline',
            { id: task.id, type: 'task' }
          );
        }
      }
      logger.info(`[Cron] Sent ${tasksDue.length} deadline reminders`);
    } catch (error) {
      logger.error('[Cron] Task deadline reminders failed:', error);
    }
  });

  cron.schedule('0 0 1 * *', async () => {
    logger.info('[Cron] Starting monthly attendance report...');
    try {
      const companies = await Company.findAll({ attributes: ['id'] });
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      for (const company of companies) {
        const stats = await Attendance.findAll({
          where: {
            companyId: company.id,
            date: { [Op.between]: [firstDay, lastDay] },
          },
          attributes: [
            'userId',
            [fn('COUNT', col('id')), 'total'],
            [fn('SUM', literal('CASE WHEN status = "present" THEN 1 ELSE 0 END')), 'present'],
            [fn('SUM', literal('CASE WHEN status = "absent" THEN 1 ELSE 0 END')), 'absent'],
            [fn('SUM', literal('CASE WHEN status = "late" THEN 1 ELSE 0 END')), 'late'],
            [fn('SUM', literal('CASE WHEN status = "half_day" THEN 1 ELSE 0 END')), 'halfDay'],
          ],
          group: ['userId'],
        });

        const admins = await User.findAll({
          where: { companyId: company.id, role: 'company_admin' },
        });

        for (const admin of admins) {
          await notificationService.create(admin.id, {
            title: 'Monthly Attendance Report',
            message: `Attendance report for ${firstDay.toISOString().split('T')[0]} to ${lastDay.toISOString().split('T')[0]} is ready. Total employees tracked: ${stats.length}`,
            type: 'system',
            referenceType: 'report',
            referenceId: 'monthly-attendance',
            companyId: company.id,
          });
        }
      }
      logger.info('[Cron] Monthly attendance report completed');
    } catch (error) {
      logger.error('[Cron] Monthly attendance report failed:', error);
    }
  });

  cron.schedule('*/30 * * * *', async () => {
    logger.info('[Cron] Checking for overdue tasks...');
    try {
      const now = new Date();

      const overdueTasks = await Task.findAll({
        where: {
          dueDate: { [Op.lt]: now },
          status: { [Op.notIn]: ['done', 'cancelled'] },
        },
        include: [
          { association: 'assignee', attributes: ['id', 'firstName', 'lastName'] },
          { association: 'project', attributes: ['name'] },
        ],
      });

      const notified = new Set();
      for (const task of overdueTasks) {
        if (task.assignee && !notified.has(task.assignee.id)) {
          const overdueCount = overdueTasks.filter((t) => t.assigneeId === task.assignee.id).length;
          await notificationService.sendPush(
            task.assignee.id,
            'Overdue Task Reminder',
            `You have ${overdueCount} overdue task(s). Please review and update.`,
            'deadline',
            { id: task.id, type: 'task' }
          );
          notified.add(task.assignee.id);
        }
      }
      logger.info(`[Cron] Checked ${overdueTasks.length} overdue tasks`);
    } catch (error) {
      logger.error('[Cron] Overdue task check failed:', error);
    }
  });

  cron.schedule('0 0 * * 0', async () => {
    logger.info('[Cron] Cleaning up old activity logs...');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const deleted = await ActivityLog.destroy({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
        },
        force: true,
      });

      logger.info(`[Cron] Deleted ${deleted} activity logs older than 90 days`);
    } catch (error) {
      logger.error('[Cron] Activity log cleanup failed:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    logger.info('[Cron] Auto-marking absent employees...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdayDay = yesterday.getDay();

      if (yesterdayDay === 0 || yesterdayDay === 6) {
        logger.info('[Cron] Skipping auto-mark absent for weekend');
        return;
      }

      const companies = await Company.findAll({ attributes: ['id'] });

      for (const company of companies) {
        const employees = await User.findAll({
          where: { companyId: company.id, isActive: true },
          attributes: ['id'],
        });

        const existingAttendances = await Attendance.findAll({
          where: { date: yesterdayStr, companyId: company.id },
          attributes: ['userId'],
        });

        const existingUserIds = new Set(existingAttendances.map((a) => a.userId));

        for (const emp of employees) {
          if (!existingUserIds.has(emp.id)) {
            const onLeave = await Leave.findOne({
              where: {
                userId: emp.id,
                startDate: { [Op.lte]: yesterdayStr },
                endDate: { [Op.gte]: yesterdayStr },
                status: 'approved',
              },
            });

            await Attendance.create({
              userId: emp.id,
              companyId: company.id,
              date: yesterdayStr,
              clockIn: null,
              clockOut: null,
              status: onLeave ? 'on_leave' : 'absent',
              totalHours: 0,
            });
          }
        }
      }
      logger.info('[Cron] Auto-mark absent completed');
    } catch (error) {
      logger.error('[Cron] Auto-mark absent failed:', error);
    }
  });

  cron.schedule('0 0 * * 1', async () => {
    logger.info('[Cron] Generating weekly timesheet reports...');
    try {
      const now = new Date();
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 6);
      lastWeekStart.setHours(0, 0, 0, 0);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);

      const companies = await Company.findAll({ attributes: ['id', 'name'] });

      for (const company of companies) {
        const employees = await User.findAll({
          where: { companyId: company.id, isActive: true },
          attributes: ['id', 'firstName', 'lastName'],
        });

        for (const emp of employees) {
          const totalSeconds = await TimeEntry.sum('duration', {
            where: {
              userId: emp.id,
              date: {
                [Op.between]: [
                  lastWeekStart.toISOString().split('T')[0],
                  lastWeekEnd.toISOString().split('T')[0],
                ],
              },
            },
          });

          if (totalSeconds > 0) {
            const hours = Math.round((totalSeconds / 3600) * 100) / 100;
            await notificationService.create(emp.id, {
              title: 'Weekly Timesheet Summary',
              message: `You logged ${hours} hours last week (${lastWeekStart.toISOString().split('T')[0]} - ${lastWeekEnd.toISOString().split('T')[0]}).`,
              type: 'system',
              referenceType: 'timesheet',
              referenceId: 'weekly',
              companyId: company.id,
            });
          }
        }
      }
      logger.info('[Cron] Weekly timesheet reports generated');
    } catch (error) {
      logger.error('[Cron] Weekly timesheet report failed:', error);
    }
  });

  logger.info('[Cron] All cron jobs initialized');
}

module.exports = { initCron };
