"""
Quick test script to verify Modal deployment locally.
Run this to see the actual error message.
"""

import modal
from pathlib import Path

# Test configuration
project_root = Path(__file__).parent
print(f"Project root: {project_root}")
print(f"Backend path: {project_root / 'backend'}")
print(f"Requirements: {project_root / 'backend' / 'requirements.txt'}")

# Check if files exist
if not (project_root / "backend" / "requirements.txt").exists():
    print("❌ requirements.txt not found!")
else:
    print("✅ requirements.txt found")

if not (project_root / "backend" / "app").exists():
    print("❌ backend/app directory not found!")
else:
    print("✅ backend/app directory found")

# Try creating the image
try:
    print("\nTesting image creation...")
    image = (
        modal.Image.debian_slim(python_version="3.11")
        .pip_install_from_requirements(project_root / "backend" / "requirements.txt")
        .apt_install("tesseract-ocr", "libmagic1")
        .copy_local_dir(project_root / "backend" / "app", "/app")
    )
    print("✅ Image configuration created successfully")
except Exception as e:
    print(f"❌ Error creating image: {e}")

print("\nTo deploy, run:")
print("modal deploy modal_deployment/modal_app.py")
