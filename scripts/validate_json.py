import functools
import json
from jsonschema import validate

json_file = 'public/data/{}.json'
json_schema_file = 'scripts/schemas/{}.schema.json'


def validate_events(validate_type: str):
    schema = json.load(open(json_schema_file.format(validate_type)))
    data = json.load(open(json_file.format(validate_type)))
    validate(data, schema)


def validation_wrapper(func, description: str = None):
    print(f"Starting validation: {description}")
    try:
        func()
        print(f"Validation successful: {description}")
    except Exception as e:
        print("Validation failed with error: " + str(e))
        exit(1)


if __name__ == '__main__':
    validation_wrapper(functools.partial(validate_events, 'events'), 'events')
    validation_wrapper(functools.partial(validate_events, 'tags'), 'tags')
    validation_wrapper(functools.partial(validate_events, 'communities'), 'communities')
    validation_wrapper(functools.partial(validate_events, 'tag_groups'), 'tag_groups')
