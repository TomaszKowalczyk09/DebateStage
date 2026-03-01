import json

from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from .models import DebateSettings, Speaker


def projector_view(request):
	DebateSettings.get_solo()
	return render(request, 'debate/index.html')


def operator_view(request):
	DebateSettings.get_solo()
	return render(request, 'debate/operator.html')


def _serialize_state(settings):
	speakers = list(settings.speakers.order_by('position', 'id'))
	if not speakers:
		current_speaker = None
		current_index = 0
	else:
		current_index = min(settings.current_speaker_index, len(speakers) - 1)
		current_speaker = speakers[current_index]

	return {
		'eventTitle': settings.event_title,
		'topic': settings.topic,
		'question': settings.question,
		'defaultSpeechSeconds': settings.default_speech_seconds,
		'currentSpeakerIndex': current_index,
		'currentSpeaker': {
			'id': current_speaker.id,
			'name': current_speaker.name,
			'description': current_speaker.description,
			'star': current_speaker.star,
			'warn': current_speaker.warn,
		} if current_speaker else None,
		'speakers': [
			{
				'id': speaker.id,
				'name': speaker.name,
				'description': speaker.description,
				'position': speaker.position,
				'star': speaker.star,
				'warn': speaker.warn,
			}
			for speaker in speakers
		],
	}


def _parse_json(request):
	try:
		return json.loads(request.body or '{}')
	except json.JSONDecodeError:
		return None


def _normalize_positions(settings):
	speakers = settings.speakers.order_by('position', 'id')
	for new_position, speaker in enumerate(speakers):
		if speaker.position != new_position:
			speaker.position = new_position
			speaker.save(update_fields=['position'])


@require_http_methods(['GET', 'PATCH'])
def state_api(request):
	settings = DebateSettings.get_solo()

	if request.method == 'PATCH':
		payload = _parse_json(request)
		if payload is None:
			return HttpResponseBadRequest('Niepoprawny JSON.')

		field_map = {
			'eventTitle': 'event_title',
			'topic': 'topic',
			'question': 'question',
			'defaultSpeechSeconds': 'default_speech_seconds',
			'currentSpeakerIndex': 'current_speaker_index',
		}

		updated_fields = []
		for source_name, model_name in field_map.items():
			if source_name in payload:
				setattr(settings, model_name, payload[source_name])
				updated_fields.append(model_name)

		if updated_fields:
			settings.save(update_fields=updated_fields + ['updated_at'])

	return JsonResponse(_serialize_state(settings))


@require_http_methods(['POST'])
def add_speaker_api(request):
	settings = DebateSettings.get_solo()
	payload = _parse_json(request)
	if payload is None:
		return HttpResponseBadRequest('Niepoprawny JSON.')

	name = (payload.get('name') or '').strip()
	if not name:
		return HttpResponseBadRequest('Pole name jest wymagane.')

	description = (payload.get('description') or '').strip()
	next_position = settings.speakers.count()
	Speaker.objects.create(
		settings=settings,
		name=name,
		description=description,
		position=next_position,
	)
	return JsonResponse(_serialize_state(settings), status=201)


@require_http_methods(['DELETE'])
def delete_speaker_api(request, speaker_id):
	settings = DebateSettings.get_solo()
	speaker = get_object_or_404(Speaker, pk=speaker_id, settings=settings)
	speaker.delete()
	_normalize_positions(settings)

	total = settings.speakers.count()
	if total == 0:
		settings.current_speaker_index = 0
	elif settings.current_speaker_index >= total:
		settings.current_speaker_index = total - 1
	settings.save(update_fields=['current_speaker_index', 'updated_at'])

	return JsonResponse(_serialize_state(settings))


@require_http_methods(['POST'])
def move_speaker_api(request, speaker_id):
	settings = DebateSettings.get_solo()
	payload = _parse_json(request)
	if payload is None:
		return HttpResponseBadRequest('Niepoprawny JSON.')

	direction = payload.get('direction')
	if direction not in {'up', 'down'}:
		return HttpResponseBadRequest('direction musi mieć wartość up/down.')

	speakers = list(settings.speakers.order_by('position', 'id'))
	index_by_id = {speaker.id: index for index, speaker in enumerate(speakers)}
	if speaker_id not in index_by_id:
		return HttpResponseBadRequest('Nie znaleziono mówcy.')

	current_index = index_by_id[speaker_id]
	target_index = current_index - 1 if direction == 'up' else current_index + 1

	if target_index < 0 or target_index >= len(speakers):
		return JsonResponse(_serialize_state(settings))

	speakers[current_index], speakers[target_index] = speakers[target_index], speakers[current_index]

	for position, speaker in enumerate(speakers):
		if speaker.position != position:
			speaker.position = position
			speaker.save(update_fields=['position'])

	settings.current_speaker_index = min(settings.current_speaker_index, max(len(speakers) - 1, 0))
	settings.save(update_fields=['current_speaker_index', 'updated_at'])

	return JsonResponse(_serialize_state(settings))


@require_http_methods(['PATCH'])
def speaker_flags_api(request, speaker_id):
	settings = DebateSettings.get_solo()
	payload = _parse_json(request)
	if payload is None:
		return HttpResponseBadRequest('Niepoprawny JSON.')

	speaker = get_object_or_404(Speaker, pk=speaker_id, settings=settings)

	updated = []
	if 'star' in payload:
		speaker.star = bool(payload['star'])
		updated.append('star')
	if 'warn' in payload:
		speaker.warn = bool(payload['warn'])
		updated.append('warn')

	if updated:
		speaker.save(update_fields=updated)

	return JsonResponse(_serialize_state(settings))
