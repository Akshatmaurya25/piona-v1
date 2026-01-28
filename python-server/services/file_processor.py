import pandas as pd
import json
import logging
from typing import List, Dict, Any
import io

logger = logging.getLogger("piona.file_processor")


def _make_serializable(obj):
    """Convert numpy/pandas types to native Python types for JSON serialization"""
    if isinstance(obj, dict):
        return {k: _make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_make_serializable(v) for v in obj]
    elif hasattr(obj, 'item'):  # numpy scalar
        return obj.item()
    elif pd.isna(obj):
        return None
    else:
        return obj


class FileProcessor:
    """Process CSV and Excel files into text chunks"""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def process_csv(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Process CSV file content into chunks"""
        logger.info(f"📄 Processing CSV ({len(file_content)} bytes)")
        df = pd.read_csv(io.BytesIO(file_content))
        logger.info(f"   Rows: {len(df)}, Columns: {len(df.columns)}")
        return self._dataframe_to_chunks(df)

    def process_excel(self, file_content: bytes) -> List[Dict[str, Any]]:
        """Process Excel file content into chunks"""
        logger.info(f"📄 Processing Excel ({len(file_content)} bytes)")
        df = pd.read_excel(io.BytesIO(file_content))
        logger.info(f"   Rows: {len(df)}, Columns: {len(df.columns)}")
        return self._dataframe_to_chunks(df)

    def _dataframe_to_chunks(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convert DataFrame to text chunks"""
        chunks = []
        columns = [str(c) for c in df.columns.tolist()]

        for index, row in df.iterrows():
            text_parts = []
            for col in columns:
                value = row[col]
                if pd.notna(value):
                    text_parts.append(f"{col}: {value}")

            chunk_text = " | ".join(text_parts)

            if len(chunk_text) > self.chunk_size:
                sub_chunks = self._split_text(chunk_text)
                for i, sub_chunk in enumerate(sub_chunks):
                    chunks.append({
                        "content": sub_chunk,
                        "row_reference": f"row_{index}_part_{i}",
                        "metadata": _make_serializable({
                            "columns": columns,
                            "original_row_index": int(index),
                            "is_split": True,
                            "part": i
                        })
                    })
            else:
                chunks.append({
                    "content": chunk_text,
                    "row_reference": f"row_{index}",
                    "metadata": _make_serializable({
                        "columns": columns,
                        "original_row_index": int(index),
                        "row_data": {str(k): str(v) if pd.notna(v) else None for k, v in row.to_dict().items()}
                    })
                })

        logger.info(f"   ✅ Created {len(chunks)} chunks")
        return chunks

    def _split_text(self, text: str) -> List[str]:
        """Split long text into overlapping chunks"""
        if len(text) <= self.chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size

            if end < len(text):
                break_chars = [" | ", " ", ","]
                for char in break_chars:
                    last_break = text.rfind(char, start, end)
                    if last_break > start:
                        end = last_break + len(char)
                        break

            chunks.append(text[start:end].strip())
            start = end - self.chunk_overlap

        return chunks

    def get_file_metadata(self, file_content: bytes, file_type: str) -> Dict[str, Any]:
        """Extract metadata from file"""
        try:
            if file_type == "csv":
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                df = pd.read_excel(io.BytesIO(file_content))

            # Convert sample data to plain Python types
            sample_records = []
            for record in df.head(3).to_dict(orient="records"):
                clean = {}
                for k, v in record.items():
                    if pd.isna(v):
                        clean[str(k)] = None
                    elif hasattr(v, 'item'):
                        clean[str(k)] = v.item()
                    else:
                        clean[str(k)] = str(v)
                sample_records.append(clean)

            return {
                "row_count": int(len(df)),
                "column_count": int(len(df.columns)),
                "columns": [str(c) for c in df.columns.tolist()],
                "sample_data": sample_records
            }
        except Exception as e:
            logger.error(f"Metadata extraction failed: {e}")
            return {"error": str(e)}
