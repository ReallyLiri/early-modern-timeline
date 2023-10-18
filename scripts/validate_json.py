import json
from jsonschema import validate

json_file = '/Users/mia/dev/personal/early-modern-timeline/public/events.json'
json_schema_file = '/Users/mia/dev/personal/early-modern-timeline/scripts/events.schema.json'


def validate_events():
    events_schema = json.load(open(json_schema_file))
    events = json.load(open(json_file))
    validate(events, events_schema)


if __name__ == '__main__':
    try:
        validate_events()
    except Exception as e:
        print("Validation failed with error: " + str(e))
        exit(1)
