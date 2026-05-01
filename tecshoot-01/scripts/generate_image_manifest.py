"""
Generate a JSON manifest of images under the project's `images/` folder.
Saves to `images/manifest.json` with structure:
{
  "projects": [
    {
      "id": "project-folder-name",
      "title": "Project Title",
      "images": ["relative/path/to/img1.jpg", "relative/path/to/img2.jpg"]
    },
    ...
  ]
}

This script is intentionally simple and uses filesystem names as titles.
"""

import os
import json

ROOT = os.path.join(os.path.dirname(__file__), '..')
IMAGES_DIR = os.path.join(ROOT, 'images')
MANIFEST_PATH = os.path.join(IMAGES_DIR, 'manifest.json')

projects = []

for root, dirs, files in os.walk(IMAGES_DIR):
    # Only look at top-level project folders (skip nested subfolders for projects)
    # We'll treat each folder that contains image files as a project
    rel_root = os.path.relpath(root, IMAGES_DIR)
    if rel_root == '.':
        # root images folder itself
        continue
    # collect image files
    imgs = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
    if not imgs:
        continue
    # build relative paths
    paths = [os.path.join('images', rel_root, f).replace('\\','/') for f in sorted(imgs)]
    projects.append({
        'id': rel_root.replace(os.sep, '_'),
        'title': rel_root,
        'images': paths
    })

manifest = {'projects': projects}

os.makedirs(IMAGES_DIR, exist_ok=True)
with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Wrote manifest with {len(projects)} projects to {MANIFEST_PATH}")