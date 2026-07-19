#!/usr/bin/env python3
"""Tests for the GSRE flash cards app."""
from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "quiz" / "data"
JS = ROOT / "quiz" / "js"
CARDS_HTML = ROOT / "cards" / "index.html"
JSC = Path("/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc")

REQUIRED_DOM_IDS = [
    "cards-remaining",
    "cards-detail",
    "face-mode-btn",
    "reset-cards-btn",
    "cards-meta",
    "flash-card",
    "prompt-text",
    "reveal-text",
    "rating-bar",
    "cards-done",
    "done-reset-btn",
]

REQUIRED_SCRIPTS = [
    "quiz/js/cards-loader.js",
    "quiz/js/format.js",
    "quiz/js/cards-storage.js",
    "quiz/js/cards-engine.js",
    "quiz/js/cards-ui.js",
    "quiz/js/cards-app.js",
]


def insert_index_for_rating(queue_len: int, rating: int):
    if rating == 4:
        return None
    if rating == 1:
        return min(1, queue_len)
    if rating == 2:
        return min(3, queue_len)
    if rating == 3:
        return queue_len
    return None


def resolve_cards_data_base(page_href: str, script_src: str) -> str:
    """Mirror cards-loader.js path resolution."""
    if script_src:
        site_root = urljoin(script_src, "../..")
        return urljoin(site_root, "quiz/data/")

    parsed = urlparse(page_href)
    path = re.sub(r"/?index\.html$", "", parsed.path)
    path = re.sub(r"/cards/?$", "/", path)
    if not path.endswith("/"):
        path = f"{path}/"
    return f"{parsed.scheme}://{parsed.netloc}{path}quiz/data/"


class CardBankTests(unittest.TestCase):
    def test_cards_bank_is_valid(self):
        registry = json.loads((DATA / "cards.json").read_text(encoding="utf-8"))
        decks = registry.get("decks") or []
        self.assertTrue(decks, "cards.json has no decks")
        seen = set()
        total = 0
        errors = []
        for deck in decks:
            path = DATA / deck["dataFile"]
            self.assertTrue(path.exists(), f"missing {deck['dataFile']}")
            cards = json.loads(path.read_text(encoding="utf-8")).get("cards", [])
            if deck.get("cardCount") is not None:
                self.assertEqual(deck["cardCount"], len(cards))
            for card in cards:
                total += 1
                cid = card.get("id")
                if not cid:
                    errors.append("missing id")
                    continue
                if cid in seen:
                    errors.append(f"duplicate {cid}")
                seen.add(cid)
                for field in ("front", "back"):
                    if not (card.get(field) or "").strip():
                        errors.append(f"{cid}: missing {field}")
        self.assertEqual(errors, [], "\n".join(errors[:20]))
        self.assertGreaterEqual(total, 80)

    def test_core_deck_covers_all_quiz_modules(self):
        sections = json.loads((DATA / "sections.json").read_text(encoding="utf-8"))
        cards = json.loads((DATA / "cards" / "core.json").read_text(encoding="utf-8"))["cards"]
        prefixes = {c["id"].split("-")[1] for c in cards}
        expected = {
            "WX": "WX",
            "A1": "A1",
            "A2": "A2",
            "B1": "B1",
            "B2": "B2",
            "B3": "B3",
            "B4": "B4",
            "B5": "B5",
            "B6": "B6",
            "B7": "B7",
            "B8": "B8",
            "B9": "B9",
            "C1": "C1",
            "C2": "C2",
            "C3": "C3",
            "C4": "C4",
            "C5": "C5",
            "D1": "D1",
            "D2": "D2",
            "E3": "E3",
            "SR-PRIN": "SR",
            "SR-SCALE": "SRS",
            "WB-FOUND": "WB",
            "BS-IMPL": "BS",
            "CR-REVIEW": "CR",
            "SA-VIDEO": "SA",
        }
        missing = [
            mid
            for mid in sorted(m["id"] for m in sections["modules"])
            if expected.get(mid) not in prefixes
        ]
        self.assertEqual(missing, [], f"modules without flash cards: {missing}")

    def test_core_deck_includes_formatted_code_review_cards(self):
        cards = json.loads((DATA / "cards" / "core.json").read_text(encoding="utf-8"))["cards"]
        cr_code = [
            c
            for c in cards
            if c["id"].startswith("FC-CR-") and "```" in c.get("front", "")
        ]
        self.assertGreaterEqual(len(cr_code), 40, "expected many CR cards with code fences")
        sample = cr_code[0]["front"]
        self.assertIn("```python", sample)

    def test_core_deck_size(self):
        registry = json.loads((DATA / "cards.json").read_text(encoding="utf-8"))
        self.assertEqual(len(registry["decks"]), 1)
        core = json.loads((DATA / "cards" / "core.json").read_text(encoding="utf-8"))
        n = len(core["cards"])
        self.assertGreaterEqual(n, 80)
        self.assertLessEqual(n, 400)
        self.assertEqual(registry["decks"][0]["cardCount"], n)


class CardsAppTests(unittest.TestCase):
    def test_html_has_required_dom_ids(self):
        html = CARDS_HTML.read_text(encoding="utf-8")
        for dom_id in REQUIRED_DOM_IDS:
            self.assertIn(f'id="{dom_id}"', html, f"missing #{dom_id}")

    def test_html_loads_scripts(self):
        html = CARDS_HTML.read_text(encoding="utf-8")
        for script in REQUIRED_SCRIPTS:
            self.assertIn(script, html, f"missing script {script}")
        self.assertIn('id="cards-loader"', html)

    def test_study_page_links_to_cards(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="cards/"', html)
        self.assertIn("Flash cards", html)

    def test_rating_buttons_present(self):
        html = CARDS_HTML.read_text(encoding="utf-8")
        for i in range(1, 5):
            self.assertIn(f'data-rating="{i}"', html)

    def test_queue_insert_indices(self):
        self.assertEqual(insert_index_for_rating(10, 1), 1)
        self.assertEqual(insert_index_for_rating(10, 2), 3)
        self.assertEqual(insert_index_for_rating(10, 3), 10)
        self.assertIsNone(insert_index_for_rating(10, 4))
        self.assertEqual(insert_index_for_rating(0, 1), 0)
        self.assertEqual(insert_index_for_rating(2, 2), 2)

    def test_engine_exports_insert_helper(self):
        engine = (JS / "cards-engine.js").read_text(encoding="utf-8")
        self.assertIn("insertIndexForRating", engine)
        self.assertIn("min(1, queue.length)", engine)
        self.assertIn("min(3, queue.length)", engine)

    def test_loader_resolves_from_cards_page(self):
        base = resolve_cards_data_base(
            "https://jrodimusprime.github.io/GSRE/cards/",
            "https://jrodimusprime.github.io/GSRE/quiz/js/cards-loader.js",
        )
        self.assertEqual(base, "https://jrodimusprime.github.io/GSRE/quiz/data/")

    def test_loader_fallback_from_cards_path(self):
        base = resolve_cards_data_base(
            "https://jrodimusprime.github.io/GSRE/cards/",
            "",
        )
        self.assertEqual(base, "https://jrodimusprime.github.io/GSRE/quiz/data/")


class CardsJSCSmokeTests(unittest.TestCase):
    def test_jsc_queue_smoke_if_available(self):
        runner = ROOT / "tests" / "jsc_cards_test_runner.js"
        if not JSC.exists():
            self.skipTest("JavaScriptCore (jsc) not available")
        proc = subprocess.run(
            [str(JSC), str(runner)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(
            proc.returncode,
            0,
            msg=f"jsc cards smoke failed\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}",
        )
        self.assertIn("PASS", proc.stdout)


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
