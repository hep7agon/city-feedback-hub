# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-09 21:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_auto_20160305_2246'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedback',
            name='service_request_id',
            field=models.CharField(db_index=True, max_length=254, null=True),
        ),
    ]
