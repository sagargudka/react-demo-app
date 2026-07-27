import json
import glob
import os

files = glob.glob('/home/sagar/rebase/sagar-personal/system-design/blueprints/*.md')
print(f"Found {len(files)} blueprint files.")

topic_data = []

for filepath in sorted(files):
    basename = os.path.basename(filepath).replace('.md', '')
    title_raw = basename.replace('-', ' ').title()
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    topic_data.append({
        "id": f"sys-{basename}",
        "category": "High-Level & Low-Level System Design",
        "question": f"System Design: {title_raw} Blueprint",
        "snippet": f"System Topology & Microservices Dataflow Diagram for {title_raw}",
        "answer": content
    })

# Write to apps/host/public/data/system-design.json
public_path = '/home/sagar/rebase/react-demo-app/apps/host/public/data/system-design.json'
dist_path = '/home/sagar/rebase/react-demo-app/apps/host/dist/data/system-design.json'

with open(public_path, 'w', encoding='utf-8') as f:
    json.dump(topic_data, f, indent=2)

with open(dist_path, 'w', encoding='utf-8') as f:
    json.dump(topic_data, f, indent=2)

print(f"Successfully compiled {len(topic_data)} system design topics into system-design.json!")
