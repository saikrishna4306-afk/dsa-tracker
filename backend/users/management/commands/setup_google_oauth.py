import os

from django.core.management.base import BaseCommand, CommandError
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = "Create or update the Google SocialApp configuration."

    def handle(self, *args, **options):
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

        if not client_id or not client_secret:
            raise CommandError(
                "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured."
            )

        site = Site.objects.get(pk=2)

        social_app, created = SocialApp.objects.update_or_create(
            provider="google",
            defaults={
                "name": "Google",
                "client_id": client_id,
                "secret": client_secret,
                "key": "",
            },
        )

        social_app.sites.set([site])

        action = "created" if created else "updated"

        self.stdout.write(
            self.style.SUCCESS(
                f"Google SocialApp {action} successfully and connected to Site {site.id}."
            )
        )