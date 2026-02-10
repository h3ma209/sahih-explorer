#!/usr/bin/env python3
"""
Convert JSON scholar data to SQLite database with normalized schema.
This script processes 24,326 scholar JSON files and creates a relational database.
"""

import json
import sqlite3
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
import argparse


class ScholarDatabaseConverter:
    def __init__(self, data_dir: str, output_db: str):
        self.data_dir = Path(data_dir)
        self.output_db = output_db
        self.conn = None
        self.cursor = None
        self.stats = {
            "scholars_processed": 0,
            "hadiths_processed": 0,
            "relationships_created": 0,
            "errors": [],
        }

    def create_schema(self):
        """Create normalized database schema with indexes."""
        print("Creating database schema...")

        # Main scholars table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS scholars (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                full_name TEXT,
                grade TEXT,
                birth_date_hijri TEXT,
                birth_date_gregorian TEXT,
                birth_place TEXT,
                death_date_hijri TEXT,
                death_date_gregorian TEXT,
                death_place TEXT,
                death_reason TEXT
            )
        """)

        # Relationships table (parents, children, spouses, teachers, students)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS scholar_relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholar_id INTEGER NOT NULL,
                related_scholar_id INTEGER NOT NULL,
                relationship_type TEXT NOT NULL,
                FOREIGN KEY (scholar_id) REFERENCES scholars(id),
                FOREIGN KEY (related_scholar_id) REFERENCES scholars(id)
            )
        """)

        # Places of stay
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS scholar_places (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholar_id INTEGER NOT NULL,
                place TEXT NOT NULL,
                FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            )
        """)

        # Areas of interest
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS scholar_interests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholar_id INTEGER NOT NULL,
                interest TEXT NOT NULL,
                FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            )
        """)

        # Tags
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS scholar_tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scholar_id INTEGER NOT NULL,
                tag TEXT NOT NULL,
                FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            )
        """)

        # Hadiths table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS hadiths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hadith_no TEXT NOT NULL,
                source TEXT NOT NULL,
                chapter TEXT,
                chapter_no TEXT,
                text_ar TEXT,
                text_en TEXT
            )
        """)

        # Hadith chains (narration chain)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS hadith_chains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hadith_id INTEGER NOT NULL,
                scholar_id INTEGER NOT NULL,
                position INTEGER NOT NULL,
                FOREIGN KEY (hadith_id) REFERENCES hadiths(id),
                FOREIGN KEY (scholar_id) REFERENCES scholars(id)
            )
        """)

        # Create indexes for performance
        print("Creating indexes...")
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_scholar_name ON scholars(name)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_scholar_grade ON scholars(grade)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_relationship_scholar ON scholar_relationships(scholar_id)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_relationship_related ON scholar_relationships(related_scholar_id)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_relationship_type ON scholar_relationships(relationship_type)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_hadith_source ON hadiths(source)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_hadith_chain_hadith ON hadith_chains(hadith_id)"
        )
        self.cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_hadith_chain_scholar ON hadith_chains(scholar_id)"
        )

        # Full-text search virtual table for scholar names
        self.cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS scholars_fts USING fts5(
                id UNINDEXED,
                name,
                full_name,
                content=scholars,
                content_rowid=id
            )
        """)

        self.conn.commit()
        print("Schema created successfully!")

    def insert_scholar(self, scholar_data: Dict[str, Any]) -> bool:
        """Insert a scholar and all related data."""
        try:
            scholar_id = int(scholar_data["id"])

            # Extract biography data
            bio = scholar_data.get("biography", {})
            birth = bio.get("birth", {})
            death = bio.get("death", {})

            # Insert main scholar record
            self.cursor.execute(
                """
                INSERT OR REPLACE INTO scholars 
                (id, name, full_name, grade, birth_date_hijri, birth_date_gregorian, 
                 birth_place, death_date_hijri, death_date_gregorian, death_place, death_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    scholar_id,
                    scholar_data.get("name", ""),
                    scholar_data.get("full_name", ""),
                    scholar_data.get("grade", ""),
                    birth.get("date_hijri", ""),
                    birth.get("date_gregorian", ""),
                    birth.get("place", ""),
                    death.get("date_hijri", ""),
                    death.get("date_gregorian", ""),
                    death.get("place", ""),
                    death.get("reason", ""),
                ),
            )

            # Insert into FTS table
            self.cursor.execute(
                """
                INSERT INTO scholars_fts (id, name, full_name)
                VALUES (?, ?, ?)
            """,
                (
                    scholar_id,
                    scholar_data.get("name", ""),
                    scholar_data.get("full_name", ""),
                ),
            )

            # Insert places of stay
            for place in bio.get("places_of_stay", []):
                self.cursor.execute(
                    "INSERT INTO scholar_places (scholar_id, place) VALUES (?, ?)",
                    (scholar_id, place),
                )

            # Insert areas of interest
            for interest in bio.get("area_of_interest", []):
                self.cursor.execute(
                    "INSERT INTO scholar_interests (scholar_id, interest) VALUES (?, ?)",
                    (scholar_id, interest),
                )

            # Insert tags
            for tag in bio.get("tags", []):
                self.cursor.execute(
                    "INSERT INTO scholar_tags (scholar_id, tag) VALUES (?, ?)",
                    (scholar_id, tag),
                )

            # Insert relationships
            self._insert_relationships(
                scholar_id, scholar_data.get("parents", []), "parent"
            )
            self._insert_relationships(
                scholar_id, scholar_data.get("children", []), "child"
            )
            self._insert_relationships(
                scholar_id, scholar_data.get("spouses", []), "spouse"
            )
            self._insert_relationships(
                scholar_id, scholar_data.get("siblings", []), "sibling"
            )
            self._insert_relationships(
                scholar_id, scholar_data.get("teachers", []), "teacher"
            )
            self._insert_relationships(
                scholar_id, scholar_data.get("students", []), "student"
            )

            self.stats["scholars_processed"] += 1
            return True

        except Exception as e:
            self.stats["errors"].append(
                f"Error processing scholar {scholar_data.get('id', 'unknown')}: {str(e)}"
            )
            return False

    def _insert_relationships(
        self, scholar_id: int, related_scholars: List[Dict], rel_type: str
    ):
        """Insert relationship records."""
        for related in related_scholars:
            try:
                related_id = int(related["id"])
                self.cursor.execute(
                    """
                    INSERT INTO scholar_relationships (scholar_id, related_scholar_id, relationship_type)
                    VALUES (?, ?, ?)
                """,
                    (scholar_id, related_id, rel_type),
                )
                self.stats["relationships_created"] += 1
            except Exception as e:
                self.stats["errors"].append(f"Error creating relationship: {str(e)}")

    def insert_hadiths(self, scholar_id: int, hadiths: List[Dict]):
        """Insert hadiths and their chains."""
        for hadith in hadiths:
            try:
                # Insert hadith
                self.cursor.execute(
                    """
                    INSERT INTO hadiths (hadith_no, source, chapter, chapter_no, text_ar, text_en)
                    VALUES (?, ?, ?, ?, ?, ?)
                """,
                    (
                        hadith.get("hadith_no", ""),
                        hadith.get("source", ""),
                        hadith.get("chapter", ""),
                        hadith.get("chapter_no", ""),
                        hadith.get("text_ar", ""),
                        hadith.get("text_en", ""),
                    ),
                )

                hadith_id = self.cursor.lastrowid

                # Insert chain of narration
                chain = hadith.get("chain", [])
                for position, narrator_id in enumerate(chain):
                    self.cursor.execute(
                        """
                        INSERT INTO hadith_chains (hadith_id, scholar_id, position)
                        VALUES (?, ?, ?)
                    """,
                        (hadith_id, int(narrator_id), position),
                    )

                self.stats["hadiths_processed"] += 1

            except Exception as e:
                self.stats["errors"].append(f"Error processing hadith: {str(e)}")

    def process_all_scholars(self):
        """Process all scholar JSON files."""
        scholars_dir = self.data_dir / "scholars"

        if not scholars_dir.exists():
            print(f"Error: Scholars directory not found at {scholars_dir}")
            return False

        json_files = list(scholars_dir.glob("*.json"))
        total_files = len(json_files)

        print(f"Found {total_files} scholar files to process...")

        for idx, json_file in enumerate(json_files, 1):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Insert scholar
                self.insert_scholar(data)

                # Insert hadiths if present
                hadiths = data.get("hadiths", [])
                if hadiths:
                    self.insert_hadiths(int(data["id"]), hadiths)

                # Progress indicator
                if idx % 1000 == 0:
                    print(f"Processed {idx}/{total_files} scholars...")
                    self.conn.commit()  # Commit periodically

            except Exception as e:
                self.stats["errors"].append(f"Error reading {json_file}: {str(e)}")

        self.conn.commit()
        print(f"\nProcessing complete!")
        return True

    def print_stats(self):
        """Print conversion statistics."""
        print("\n" + "=" * 60)
        print("CONVERSION STATISTICS")
        print("=" * 60)
        print(f"Scholars processed: {self.stats['scholars_processed']}")
        print(f"Hadiths processed: {self.stats['hadiths_processed']}")
        print(f"Relationships created: {self.stats['relationships_created']}")
        print(f"Errors encountered: {len(self.stats['errors'])}")

        if self.stats["errors"]:
            print("\nFirst 10 errors:")
            for error in self.stats["errors"][:10]:
                print(f"  - {error}")

        # Database size
        if os.path.exists(self.output_db):
            size_mb = os.path.getsize(self.output_db) / (1024 * 1024)
            print(f"\nDatabase size: {size_mb:.2f} MB")

        print("=" * 60)

    def validate_database(self):
        """Validate the converted database."""
        print("\nValidating database...")

        # Count records
        self.cursor.execute("SELECT COUNT(*) FROM scholars")
        scholar_count = self.cursor.fetchone()[0]

        self.cursor.execute("SELECT COUNT(*) FROM hadiths")
        hadith_count = self.cursor.fetchone()[0]

        self.cursor.execute("SELECT COUNT(*) FROM scholar_relationships")
        relationship_count = self.cursor.fetchone()[0]

        print(f"✓ Scholars in database: {scholar_count}")
        print(f"✓ Hadiths in database: {hadith_count}")
        print(f"✓ Relationships in database: {relationship_count}")

        # Test a query
        self.cursor.execute("""
            SELECT s.name, COUNT(h.id) as hadith_count
            FROM scholars s
            LEFT JOIN hadith_chains hc ON s.id = hc.scholar_id
            LEFT JOIN hadiths h ON hc.hadith_id = h.id
            WHERE s.id = 2
            GROUP BY s.id
        """)
        result = self.cursor.fetchone()
        if result:
            print(f"✓ Sample query successful: {result[0]} has {result[1]} hadiths")

        return True

    def convert(self):
        """Main conversion process."""
        try:
            # Connect to database
            print(f"Creating database: {self.output_db}")
            self.conn = sqlite3.connect(self.output_db)
            self.cursor = self.conn.cursor()

            # Enable foreign keys
            self.cursor.execute("PRAGMA foreign_keys = ON")

            # Create schema
            self.create_schema()

            # Process all scholars
            success = self.process_all_scholars()

            if success:
                # Validate
                self.validate_database()

                # Print stats
                self.print_stats()

                print("\n✓ Conversion completed successfully!")
                return True
            else:
                print("\n✗ Conversion failed!")
                return False

        except Exception as e:
            print(f"\n✗ Fatal error: {str(e)}")
            return False
        finally:
            if self.conn:
                self.conn.close()


def main():
    parser = argparse.ArgumentParser(description="Convert JSON scholar data to SQLite")
    parser.add_argument(
        "--data-dir", default="public/data", help="Path to data directory"
    )
    parser.add_argument(
        "--output", default="public/scholars.db", help="Output database file"
    )
    parser.add_argument(
        "--validate-only", action="store_true", help="Only validate existing database"
    )

    args = parser.parse_args()

    converter = ScholarDatabaseConverter(args.data_dir, args.output)

    if args.validate_only:
        if os.path.exists(args.output):
            converter.conn = sqlite3.connect(args.output)
            converter.cursor = converter.conn.cursor()
            converter.validate_database()
            converter.conn.close()
        else:
            print(f"Database not found: {args.output}")
            sys.exit(1)
    else:
        success = converter.convert()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
