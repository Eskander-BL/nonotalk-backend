#!/usr/bin/env python3
"""
Script pour recréer la base de données NonoTalk avec le bon schéma
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app, db

def reset_database():
    """Supprime et recrée la base de données"""
    with app.app_context():
        # Supprimer toutes les tables
        db.drop_all()
        print("✓ Anciennes tables supprimées")
        
        # Créer toutes les tables avec le nouveau schéma
        db.create_all()
        print("✓ Nouvelles tables créées avec pin_hash")
        
        print("✓ Base de données réinitialisée avec succès!")

if __name__ == "__main__":
    reset_database()

