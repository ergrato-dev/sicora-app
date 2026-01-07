"""
Scheduled tasks for MEvalService.

Background tasks for automated detection and notifications.
"""

import logging
from datetime import date

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.infrastructure.database.base import async_session_maker
from app.infrastructure.repositories import (
    ImprovementPlanRepositoryImpl,
    SanctionRepositoryImpl,
    AppealRepositoryImpl,
)

logger = logging.getLogger(__name__)


class ScheduledTasks:
    """Scheduled background tasks for MEvalService."""

    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    def start(self):
        """Start the scheduler."""
        # Check overdue improvement plans - daily at 6:00 AM
        self.scheduler.add_job(
            self.check_overdue_plans,
            CronTrigger(hour=6, minute=0),
            id="check_overdue_plans",
            name="Check overdue improvement plans",
        )

        # Check plans ending soon - daily at 7:00 AM
        self.scheduler.add_job(
            self.check_plans_ending_soon,
            CronTrigger(hour=7, minute=0),
            id="check_plans_ending_soon",
            name="Check plans ending within 7 days",
        )

        # Check appeal deadlines - daily at 8:00 AM
        self.scheduler.add_job(
            self.check_appeal_deadlines,
            CronTrigger(hour=8, minute=0),
            id="check_appeal_deadlines",
            name="Check appeal deadlines",
        )

        # Check expiring sanctions - daily at 9:00 AM
        self.scheduler.add_job(
            self.check_expiring_sanctions,
            CronTrigger(hour=9, minute=0),
            id="check_expiring_sanctions",
            name="Check sanctions expiring within 7 days",
        )

        # Deactivate expired sanctions - daily at midnight
        self.scheduler.add_job(
            self.deactivate_expired_sanctions,
            CronTrigger(hour=0, minute=0),
            id="deactivate_expired_sanctions",
            name="Deactivate expired sanctions",
        )

        self.scheduler.start()
        logger.info("Scheduler started with all scheduled tasks")

    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

    async def check_overdue_plans(self):
        """Check for overdue improvement plans and send notifications."""
        logger.info("Running scheduled task: check_overdue_plans")
        try:
            async with async_session_maker() as session:
                repo = ImprovementPlanRepositoryImpl(session)
                overdue_plans = await repo.get_overdue_plans()

                if overdue_plans:
                    logger.warning(
                        f"Found {len(overdue_plans)} overdue improvement plans"
                    )
                    for plan in overdue_plans:
                        logger.info(
                            f"Overdue plan: {plan.id} - Student: {plan.student_id} - "
                            f"End date: {plan.end_date}"
                        )
                        # TODO: Send notification to supervisor and coordinator
                else:
                    logger.info("No overdue improvement plans found")
        except Exception as e:
            logger.error(f"Error checking overdue plans: {e}", exc_info=True)

    async def check_plans_ending_soon(self):
        """Check for plans ending within 7 days and send reminders."""
        logger.info("Running scheduled task: check_plans_ending_soon")
        try:
            async with async_session_maker() as session:
                repo = ImprovementPlanRepositoryImpl(session)
                ending_soon = await repo.get_plans_ending_soon(days_threshold=7)

                if ending_soon:
                    logger.info(f"Found {len(ending_soon)} plans ending within 7 days")
                    for plan in ending_soon:
                        days_remaining = (plan.end_date - date.today()).days
                        logger.info(
                            f"Plan ending soon: {plan.id} - Student: {plan.student_id} - "
                            f"Days remaining: {days_remaining}"
                        )
                        # TODO: Send reminder notification
                else:
                    logger.info("No plans ending soon")
        except Exception as e:
            logger.error(f"Error checking plans ending soon: {e}", exc_info=True)

    async def check_appeal_deadlines(self):
        """Check for appeals near processing deadline."""
        logger.info("Running scheduled task: check_appeal_deadlines")
        try:
            async with async_session_maker() as session:
                repo = AppealRepositoryImpl(session)
                near_deadline = await repo.get_appeals_near_deadline(days_threshold=3)

                if near_deadline:
                    logger.warning(f"Found {len(near_deadline)} appeals near deadline")
                    for appeal in near_deadline:
                        logger.info(
                            f"Appeal near deadline: {appeal.id} - "
                            f"Hearing date: {appeal.hearing_date}"
                        )
                        # TODO: Send urgent notification to appeals committee
                else:
                    logger.info("No appeals near deadline")
        except Exception as e:
            logger.error(f"Error checking appeal deadlines: {e}", exc_info=True)

    async def check_expiring_sanctions(self):
        """Check for sanctions expiring within 7 days."""
        logger.info("Running scheduled task: check_expiring_sanctions")
        try:
            async with async_session_maker() as session:
                repo = SanctionRepositoryImpl(session)
                expiring = await repo.get_expiring_soon(days_threshold=7)

                if expiring:
                    logger.info(
                        f"Found {len(expiring)} sanctions expiring within 7 days"
                    )
                    for sanction in expiring:
                        days_remaining = (sanction.end_date - date.today()).days
                        logger.info(
                            f"Sanction expiring: {sanction.id} - Student: {sanction.student_id} - "
                            f"Days remaining: {days_remaining}"
                        )
                        # TODO: Send notification about expiring sanction
                else:
                    logger.info("No sanctions expiring soon")
        except Exception as e:
            logger.error(f"Error checking expiring sanctions: {e}", exc_info=True)

    async def deactivate_expired_sanctions(self):
        """Automatically deactivate expired sanctions."""
        logger.info("Running scheduled task: deactivate_expired_sanctions")
        try:
            async with async_session_maker() as session:
                repo = SanctionRepositoryImpl(session)
                active_sanctions = await repo.get_active_sanctions()

                deactivated_count = 0
                today = date.today()

                for sanction in active_sanctions:
                    if sanction.end_date and sanction.end_date < today:
                        sanction.deactivate()
                        await repo.update(sanction)
                        deactivated_count += 1
                        logger.info(
                            f"Deactivated expired sanction: {sanction.id} - "
                            f"End date was: {sanction.end_date}"
                        )

                if deactivated_count > 0:
                    logger.info(f"Deactivated {deactivated_count} expired sanctions")
                else:
                    logger.info("No expired sanctions to deactivate")
        except Exception as e:
            logger.error(f"Error deactivating expired sanctions: {e}", exc_info=True)


# Global scheduler instance
scheduler = ScheduledTasks()
