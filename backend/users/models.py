from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        USER='USER','user'
        ADMIN='ADMIN','admin'
    role=models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
    )    
