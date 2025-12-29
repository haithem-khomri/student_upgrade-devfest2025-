#!/usr/bin/env python3
"""
Setup script for Face Recognition feature
Checks dependencies and downloads models
"""
import sys
import subprocess
import importlib

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✓ {package_name} is installed")
        return True
    except ImportError:
        print(f"✗ {package_name} is NOT installed")
        return False

def install_package(package_name):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"✓ Successfully installed {package_name}")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Failed to install {package_name}")
        return False

def main():
    print("=" * 60)
    print("Face Recognition Setup")
    print("=" * 60)
    print()
    
    required_packages = [
        ("opencv-python", "cv2"),
        ("numpy", "numpy"),
        ("Pillow", "PIL"),
    ]
    
    optional_packages = [
        ("face-recognition", "face_recognition"),
        ("dlib", "dlib"),
        ("deepface", "deepface"),
        ("mediapipe", "mediapipe"),
    ]
    
    print("Checking required packages...")
    print("-" * 60)
    missing_required = []
    
    for package, import_name in required_packages:
        if not check_package(package, import_name):
            missing_required.append(package)
    
    print()
    print("Checking optional packages...")
    print("-" * 60)
    missing_optional = []
    
    for package, import_name in optional_packages:
        if not check_package(package, import_name):
            missing_optional.append(package)
    
    print()
    
    if missing_required:
        print("⚠ Missing required packages!")
        print("Installing required packages...")
        for package in missing_required:
            install_package(package)
        print()
    
    if missing_optional:
        print("⚠ Missing optional packages (recommended for better accuracy)")
        response = input("Install optional packages? (y/n): ").strip().lower()
        if response == 'y':
            print("Installing optional packages...")
            for package in missing_optional:
                install_package(package)
            print()
    
    print("=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Models will download automatically on first use")
    print("2. Start the backend server: python -m uvicorn main:app --reload")
    print("3. Access the face recognition feature at: /features/face-recognition")
    print()
    print("Note: dlib installation may require additional steps on Windows.")
    print("See FACE_RECOGNITION_SETUP.md for detailed instructions.")

if __name__ == "__main__":
    main()

