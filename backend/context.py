import json
import re
from pathlib import Path
from typing import Any


class ContextStore:
    def __init__(self, data_path: Path | None = None) -> None:
        self.data_path = data_path or Path(__file__).resolve().parent / "data" / "tourism_context.json"
        self.records = self._load_records()
        self.by_id = {record["id"]: record for record in self.records}

    def _load_records(self) -> list[dict[str, Any]]:
        with self.data_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        records = payload.get("records", [])
        if not isinstance(records, list):
            raise ValueError("Tourism context must contain a records list")
        return records

    def get(self, context_id: str | None) -> dict[str, Any] | None:
        return self.by_id.get(context_id) if context_id else None

    @property
    def ids(self) -> set[str]:
        return set(self.by_id)

    def search(self, message: str, context_id: str | None = None, limit: int = 3) -> list[dict[str, Any]]:
        selected = self.get(context_id)
        if selected:
            return [selected]

        query_tokens = self._tokens(message)
        scored: list[tuple[int, dict[str, Any]]] = []
        for record in self.records:
            searchable = " ".join(
                [
                    record.get("topic", ""),
                    *record.get("names", []),
                    *record.get("keywords", []),
                ]
            )
            record_tokens = self._tokens(searchable)
            score = len(query_tokens & record_tokens)
            if score:
                scored.append((score, record))

        scored.sort(key=lambda item: item[0], reverse=True)
        matches = [record for _, record in scored[:limit]]
        return matches

    @staticmethod
    def _tokens(value: str) -> set[str]:
        return {token.lower() for token in re.findall(r"[\w]+", value, flags=re.UNICODE) if len(token) > 2}
