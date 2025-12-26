import os
import time
from typing import List
from app.services.rag_service import rag_service

class AutoLearningService:
    def __init__(self):
        self.watched_directories = []
        self.known_files = set()

    def add_watch_directory(self, path: str):
        if os.path.exists(path) and path not in self.watched_directories:
            self.watched_directories.append(path)
            print(f"Started watching directory: {path}")

    def scan_and_learn(self):
        """
        Scans watched directories for new PDF files and ingests them.
        """
        new_knowledge_count = 0
        for directory in self.watched_directories:
            for root, _, files in os.walk(directory):
                for file in files:
                    if file.endswith(".pdf"):
                        full_path = os.path.join(root, file)
                        if full_path not in self.known_files:
                            print(f"Discovered new knowledge: {file}")
                            try:
                                rag_service.ingest_file(full_path)
                                self.known_files.add(full_path)
                                new_knowledge_count += 1
                            except Exception as e:
                                print(f"Failed to learn from {file}: {e}")
        
        return new_knowledge_count

auto_learner = AutoLearningService()
