from django.db import models

# Create your models here.
class Question(models.Model):
    class Difficulty(models.TextChoices):
        EASY='EASY','Easy'
        MEDIUM='MEDIUM','Medium'
        HARD='HARD','Hard'
    title=models.CharField(max_length=255)
    difficulty=models.CharField(
        max_length=10,
        choices=Difficulty.choices
    )    
    topic=models.CharField(max_length=100)
    platform=models.CharField(max_length=100)
    url=models.URLField()
    tags=models.JSONField(default=list,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)