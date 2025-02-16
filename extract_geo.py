import json, os, sys

_, PATH, NAME = sys.argv


files = [file for file in os.listdir(PATH) if os.path.isfile(os.path.join(PATH, file))]

coordinates = []

for file in files:
    with open(os.path.join(PATH, file)) as f:
        object = json.load(f)
        coordinates += object["features"][0]["geometry"]["coordinates"]

combined_object = {
    "type": "Feature",
    "geometry": {
        "type": "MultiLineString",
        "coordinates": coordinates
    }
}
output_file = open(NAME+".json", "x")
json.dump(combined_object, output_file)