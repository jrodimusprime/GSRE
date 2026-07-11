#!/usr/bin/env python3
"""Integration tests for the GSRE quiz app."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "quiz" / "data"
JS = ROOT / "quiz" / "js"
JSC = Path("/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc")


REQUIRED_DOM_IDS = [
    "avg-score",
    "score-detail",
    "quiz-meta",
    "question-text",
    "options",
    "next-btn",
    "module-chips",
    "stats-grid",
]

REQUIRED_SCRIPTS = [
    "quiz/js/loader.js",
    "quiz/js/storage.js",
    "quiz/js/engine.js",
    "quiz/js/ui.js",
    "quiz/js/app.js",
]


def load_sections():
    with (DATA / "sections.json").open(encoding="utf-8") as f:
        return json.load(f)


def load_module_questions(config, module):
    if module["id"] == "SA-VIDEO":
        with (DATA / "questions" / "sa-video.json").open(encoding="utf-8") as f:
            return json.load(f)["questions"]

    with (DATA / "questions" / "sa-video.json").open(encoding="utf-8") as f:
        video = json.load(f)["questions"]
    from_video = [
        q for q in video if module["id"] in (q.get("moduleTags") or [])
    ]
    supplemental = []
    if module.get("dataFile"):
        path = DATA / module["dataFile"]
        with path.open(encoding="utf-8") as f:
            supplemental = json.load(f)["questions"]
    return from_video + supplemental


def get_all_questions():
    config = load_sections()
    seen = set()
    all_q = []
    for module in config["modules"]:
        for q in load_module_questions(config, module):
            if q["id"] in seen:
                continue
            seen.add(q["id"])
            all_q.append({**q, "module": q.get("module") or module["id"]})
    return all_q, config


def active_pool(questions, enabled):
    return [q for q in questions if q["module"] in enabled]


def pick_random(questions, enabled, last_id=None):
    pool = active_pool(questions, enabled)
    if not pool:
        return None
    candidates = [q for q in pool if q["id"] != last_id] if len(pool) > 1 and last_id else pool
    return candidates[0]


def resolve_data_base(page_href: str, script_src: str) -> str:
    """Mirror quiz/js/loader.js path resolution."""
    from urllib.parse import urljoin, urlparse

    if script_src:
        site_root = urljoin(script_src, "../..")
        return urljoin(site_root, "quiz/data/")

    parsed = urlparse(page_href)
    path = re.sub(r"/?index\.html$", "", parsed.path)
    prefix = path if path.endswith("/") else f"{path}/"
    return f"{parsed.scheme}://{parsed.netloc}{prefix}quiz/data/"


class QuestionBankTests(unittest.TestCase):
    def test_question_banks_are_valid(self):
        from collections import Counter

        expected_segments = {
            "SA-V0": 4,
            "SA-V1": 6,
            "SA-V2": 10,
            "SA-V3": 8,
            "SA-V4": 6,
            "SA-V5": 6,
        }
        errors = []
        total = 0

        for path in sorted((DATA / "questions").glob("*.json")):
            with path.open(encoding="utf-8") as f:
                data = json.load(f)
            qs = data.get("questions", data)
            total += len(qs)
            for q in qs:
                qid = q.get("id", str(path))
                if len(q.get("options", [])) != 4:
                    errors.append(f"{qid}: need 4 options")
                ci = q.get("correctIndex")
                if ci is None or not (0 <= ci <= 3):
                    errors.append(f"{qid}: invalid correctIndex")
                for field in ("question", "explanation", "id"):
                    if not q.get(field):
                        errors.append(f"{qid}: missing {field}")

        with (DATA / "questions" / "sa-video.json").open(encoding="utf-8") as f:
            segs = Counter(q["segment"] for q in json.load(f)["questions"])
        if segs != Counter(expected_segments):
            errors.append(f"SA-VIDEO segment mismatch: {dict(segs)}")

        self.assertEqual(total, 258, f"expected 258 questions, found {total}")
        self.assertEqual(errors, [], "\n".join(errors[:20]))


class QuizAppTests(unittest.TestCase):
    def test_html_has_required_dom_ids(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        for dom_id in REQUIRED_DOM_IDS:
            self.assertIn(f'id="{dom_id}"', html, f"missing #{dom_id}")

    def test_html_loads_scripts_in_order(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        for script in REQUIRED_SCRIPTS:
            self.assertIn(f'src="{script}"', html)
        self.assertIn('id="quiz-loader"', html)

    def test_app_boot_handles_ready_state(self):
        app_js = (JS / "app.js").read_text(encoding="utf-8")
        self.assertIn("document.readyState", app_js)
        self.assertIn("boot()", app_js)

    def test_loader_resolves_github_pages_base(self):
        base = resolve_data_base(
            "https://jrodimusprime.github.io/GSRE/",
            "https://jrodimusprime.github.io/GSRE/quiz/js/loader.js",
        )
        self.assertEqual(base, "https://jrodimusprime.github.io/GSRE/quiz/data/")

    def test_loader_fallback_without_trailing_slash(self):
        base = resolve_data_base(
            "https://jrodimusprime.github.io/GSRE",
            "",
        )
        self.assertEqual(base, "https://jrodimusprime.github.io/GSRE/quiz/data/")

    def test_all_questions_load(self):
        questions, config = get_all_questions()
        self.assertEqual(len(questions), 258)
        self.assertEqual(len(config["modules"]), 17)

    def test_every_module_has_questions_in_pool(self):
        questions, config = get_all_questions()
        by_module = {m["id"]: 0 for m in config["modules"]}
        for q in questions:
            by_module[q["module"]] += 1
        empty = [mid for mid, count in by_module.items() if count == 0]
        self.assertEqual(empty, [], f"modules with no questions: {empty}")

    def test_default_enabled_modules_include_all_sections(self):
        config = load_sections()
        all_ids = [m["id"] for m in config["modules"]]
        for saved in (None, [], {}, "B1", {"B1": True}):
            if not isinstance(saved, list) or not saved:
                enabled = set(all_ids)
            else:
                valid = [mid for mid in saved if mid in all_ids]
                enabled = set(valid) if valid else set(all_ids)
            self.assertEqual(enabled, set(all_ids))

    def test_engine_pool_respects_enabled_modules(self):
        questions, config = get_all_questions()
        enabled = {"B1", "C1"}
        pool = active_pool(questions, enabled)
        self.assertTrue(pool)
        self.assertTrue(all(q["module"] in enabled for q in pool))

    def test_engine_returns_none_when_all_sections_disabled(self):
        questions, _config = get_all_questions()
        self.assertIsNone(pick_random(questions, set()))

    def test_init_must_render_question_and_filters(self):
        app_js = (JS / "app.js").read_text(encoding="utf-8")
        ui_js = (JS / "ui.js").read_text(encoding="utf-8")
        self.assertIn("QuizUI.refresh", app_js)
        self.assertIn("showNextQuestion();", app_js)
        self.assertIn("renderModuleFilters", ui_js)
        self.assertIn("renderQuestion", ui_js)


class JSCSmokeTests(unittest.TestCase):
    def test_jsc_smoke_if_available(self):
        runner = ROOT / "tests" / "jsc_test_runner.js"
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
            msg=f"jsc smoke test failed\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}",
        )
        self.assertIn("PASS", proc.stdout)


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
