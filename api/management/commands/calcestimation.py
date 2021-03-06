import logging
from datetime import timedelta

from django.core.management.base import BaseCommand

from api.analysis import calc_fixing_time
from api.models import Feedback

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Calculate and fill expected_datetime field for feedbacks which have this field empty'

    def handle(self, *args, **options):
        feedbacks = Feedback.objects.filter(expected_datetime__isnull=True)
        for f in feedbacks:
            fixing_time = timedelta(milliseconds=calc_fixing_time(f.service_code))
            if fixing_time.total_seconds() > 0:
                expected_datetime = f.requested_datetime + fixing_time
                f.expected_datetime = expected_datetime
                f.save()
        logger.info("Estimation calculation completed")
