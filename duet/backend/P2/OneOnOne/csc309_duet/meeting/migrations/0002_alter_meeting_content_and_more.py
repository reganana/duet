# Generated by Django 5.0.4 on 2024-04-04 04:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meeting', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meeting',
            name='content',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='preferred_contact',
            field=models.BooleanField(default=False),
        ),
    ]
