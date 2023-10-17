import argparse
import json
from dataclasses import dataclass

from tabulate import tabulate


json_file = '/Users/mia/dev/personal/early-modern-timeline/public/events.json'


@dataclass
class FilterBean:
    tags: list = None
    start_year: int = None
    end_year: int = None


def should_filter(event: dict, filter_bean: FilterBean):
    if not filter_bean:
        return False

    if filter_bean.tags and not any(tag in event.get('tags', []) for tag in filter_bean.tags):
        return True

    if filter_bean.start_year and event.get('year', 0) < filter_bean.start_year:
        return True

    if filter_bean.end_year and event.get('year', 0) > filter_bean.end_year:
        return True

    return False


def sort_event_key(event: dict):
    year = event.get('year', 0)
    if isinstance(year, str):
        raise RuntimeError(f"Error: year is not an int\n{event}")
    return year


def display_table(filter_bean: FilterBean = None):
    data = read_json()

    events = data.get('events', [])
    events = [event for event in events if not should_filter(event, filter_bean)]
    events = sorted(events, key=sort_event_key)

    table_data = [to_table_row(event) for event in events]
    table = tabulate(table_data,  get_table_headers(), tablefmt="grid", stralign="left")
    print(table)
    print("Total events: " + str(len(events)))


def read_json() -> dict:
    with open(json_file, 'r') as file:
        data = json.load(file)
    return data


def write_json(data: dict):
    new_file = json_file.replace('.json', '_new.json')
    with open(new_file, 'w') as file:
        json.dump(data, file)


def get_table_headers():
    return ["Year", "Title", "Tags", "Details"]


def format_line(string, line_length):
    result = ""
    for i in range(0, len(string), line_length):
        chunk = string[i:i + line_length]
        if chunk[-1] != ' ' and len(string) > i + line_length and string[i + line_length] != ' ':
            chunk = chunk + '-'
        result += chunk + '\n'
    return result.rstrip('\n')


def format_string(string: str, line_length: int = 30) -> str:
    result = ""
    for line in string.split('\n'):
        result += format_line(line, line_length) + '\n'
    return result.rstrip('\n')


def to_table_row(event: dict) -> list:
    year = event.get('year', '')
    title = format_string(event.get('title', ''), 50)
    tags_list = event.get('tags', [])
    tags_list.sort()
    tags = '\n'.join(tags_list)
    details = format_string('\n'.join(event.get('details', [])), 100)
    row = [year, title, tags, details]
    return row


def main():
    parser = argparse.ArgumentParser(description="Display data from a JSON file in a formatted table.")
    parser.add_argument('--tags', nargs='+', help='Filter events by tags')
    parser.add_argument('--start-year', type=int, help='Filter events by start year')
    parser.add_argument('--end-year', type=int, help='Filter events by end year')
    args = parser.parse_args()
    filter_bean = FilterBean(tags=args.tags, start_year=args.start_year, end_year=args.end_year)
    display_table(filter_bean)


if __name__ == "__main__":
    main()
