from django.contrib import admin
from .models import DebateSettings, Speaker


class SpeakerInline(admin.TabularInline):
	model = Speaker
	extra = 0
	ordering = ('position',)


@admin.register(DebateSettings)
class DebateSettingsAdmin(admin.ModelAdmin):
	list_display = ('event_title', 'topic', 'current_speaker_index', 'default_speech_seconds', 'updated_at')
	inlines = [SpeakerInline]


@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
	list_display = ('name', 'position', 'star', 'warn', 'settings')
	list_filter = ('settings', 'star', 'warn')
	ordering = ('settings', 'position')
