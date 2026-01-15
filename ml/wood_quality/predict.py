import argparse
import json
import os
import sys
from typing import Dict, Any, List

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from train_evaluate import build_preprocessor, get_models, load_data, RANDOM_STATE

MODELS = ["KNN", "NaiveBayes", "DecisionTree", "SVM", "NeuralNet"]


def train_if_needed(dataset_path: str, out_dir: str) -> None:
	os.makedirs(out_dir, exist_ok=True)
	# If any model missing, train them all using train_evaluate module
	missing = [m for m in MODELS if not os.path.exists(os.path.join(out_dir, f"model_{m}.joblib"))]
	if not missing:
		return
	X, y = load_data(dataset_path)
	preprocessor = build_preprocessor(X)
	X_train, X_test, y_train, y_test = train_test_split(
		X, y, test_size=0.25, random_state=RANDOM_STATE, stratify=y
	)
	models = get_models()
	for name, estimator in models.items():
		pipe = Pipeline(steps=[("preprocess", preprocessor), ("model", estimator)])
		pipe.fit(X_train, y_train)
		joblib.dump(pipe, os.path.join(out_dir, f"model_{name}.joblib"))


def load_models(out_dir: str) -> Dict[str, Any]:
	loaded = {}
	for name in MODELS:
		path = os.path.join(out_dir, f"model_{name}.joblib")
		loaded[name] = joblib.load(path)
	return loaded


def to_dataframe(payload: Dict[str, Any]) -> pd.DataFrame:
	# Expecting keys: vendor, woodType, length, width, thickness, moisture, costPerUnit
	record = {
		"Vendor": payload.get("vendor"),
		"WoodType": payload.get("woodType"),
		"Length_cm": float(payload.get("length")),
		"Width_cm": float(payload.get("width")),
		"Thickness_cm": float(payload.get("thickness")),
		"Moisture": float(payload.get("moisture")),
		"Cost_per_unit": float(payload.get("costPerUnit")),
	}
	return pd.DataFrame([record])


def predict_all(models: Dict[str, Any], df: pd.DataFrame) -> Dict[str, Any]:
	results: Dict[str, Any] = {}
	for name, pipe in models.items():
		pred = pipe.predict(df)[0]
		proba = None
		if hasattr(pipe.named_steps["model"], "predict_proba"):
			p = pipe.predict_proba(df)[0]
			classes = list(pipe.classes_)
			proba = {str(c): float(v) for c, v in zip(classes, p)}
		results[name] = {"prediction": str(pred), "probabilities": proba}
	return results


def main() -> None:
	parser = argparse.ArgumentParser(description="Predict wood quality using 5 models")
	parser.add_argument("--models_dir", type=str, default="results", help="Directory with saved joblib models")
	parser.add_argument("--data", type=str, default="dataset.csv", help="Dataset path for training if models missing")
	parser.add_argument("--input", type=str, default=None, help="Path to JSON input file; otherwise read stdin")
	args = parser.parse_args()

	# Load request JSON
	if args.input:
		with open(args.input, "r", encoding="utf-8") as f:
			payload = json.load(f)
	else:
		payload = json.load(sys.stdin)

	# Debug: Print input received
	print(f"📥 Input received for prediction: {json.dumps(payload, indent=2)}", file=sys.stderr, flush=True)

	# Train if models missing
	train_if_needed(args.data, args.models_dir)

	# Load models
	models = load_models(args.models_dir)
	print(f"✅ Loaded {len(models)} models: {list(models.keys())}", file=sys.stderr, flush=True)

	# Predict
	df = to_dataframe(payload)
	print(f"📊 DataFrame created:\n{df.to_string()}", file=sys.stderr, flush=True)
	
	results = predict_all(models, df)
	
	# Debug: Print predictions
	print(f"🧩 Model predictions:", file=sys.stderr, flush=True)
	for model_name, result in results.items():
		print(f"   {model_name}: {result['prediction']} (probabilities: {result['probabilities']})", file=sys.stderr, flush=True)
	
	print(json.dumps({"ok": True, "results": results}))


if __name__ == "__main__":
	main()
