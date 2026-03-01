from django.db import models


class DebateSettings(models.Model):
	event_title = models.CharField(max_length=200, default='Debata Szkolna 2026')
	topic = models.CharField(max_length=200, default='TOP 4 · Debata szkolna')
	question = models.CharField(max_length=400, default='Czy szkoła powinna wprowadzić mundurki?')
	default_speech_seconds = models.PositiveIntegerField(default=300)
	current_speaker_index = models.PositiveIntegerField(default=0)
	timer_remaining_seconds = models.PositiveIntegerField(default=300)
	timer_running = models.BooleanField(default=False)
	timer_started_at = models.DateTimeField(null=True, blank=True)
	sound_warning_enabled = models.BooleanField(default=True)
	sound_end_enabled = models.BooleanField(default=True)
	sound_muted = models.BooleanField(default=False)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return 'Ustawienia debaty'

	@classmethod
	def get_solo(cls):
		instance = cls.objects.first()
		if instance:
			return instance

		instance = cls.objects.create()
		default_speakers = [
			'Anna Nowak (3A)',
			'Jan Kowalski (2B)',
			'Maria Zielińska (1C)',
		]
		for position, name in enumerate(default_speakers):
			Speaker.objects.create(
				settings=instance,
				name=name,
				position=position,
			)
		return instance


class Speaker(models.Model):
    settings = models.ForeignKey(DebateSettings, on_delete=models.CASCADE, related_name='speakers')
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200, blank=True)
    position = models.PositiveIntegerField(default=0)
    star = models.BooleanField(default=False)
    warn = models.BooleanField(default=False)

    class Meta:
        ordering = ('position', 'id')

    def __str__(self):
        return self.name
