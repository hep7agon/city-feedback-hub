# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-21 19:05
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mediaurl',
            old_name='request',
            new_name='feedback',
        ),
        migrations.RenameField(
            model_name='task',
            old_name='request',
            new_name='feedback',
        ),
    ]
