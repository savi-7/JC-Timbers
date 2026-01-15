import argparse
import os
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier

RANDOM_STATE = 42


def load_data(csv_path: str) -> Tuple[pd.DataFrame, pd.Series]:
	data = pd.read_csv(csv_path)
	X = data.drop(columns=["Quality"])  # features
	y = data["Quality"].astype(str)      # target
	return X, y


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
	categorical_features = ["Vendor", "WoodType"]
	numeric_features = [c for c in X.columns if c not in categorical_features]

	preprocessor = ColumnTransformer(
		transformers=[
			("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
			("num", StandardScaler(), numeric_features),
		]
	)
	return preprocessor


def get_models() -> Dict[str, object]:
	return {
		"KNN": KNeighborsClassifier(n_neighbors=5),
		"NaiveBayes": GaussianNB(),
		"DecisionTree": DecisionTreeClassifier(random_state=RANDOM_STATE, max_depth=None),
		"SVM": SVC(kernel="rbf", probability=True, random_state=RANDOM_STATE),
		"NeuralNet": MLPClassifier(hidden_layer_sizes=(64, 32), activation="relu", max_iter=1000, random_state=RANDOM_STATE),
	}


def ensure_dirs(out_dir: str) -> Dict[str, str]:
	plots_dir = os.path.join(out_dir, "plots")
	os.makedirs(plots_dir, exist_ok=True)
	return {"out": out_dir, "plots": plots_dir}


def evaluate_model(name: str, model, X_test: np.ndarray, y_test: pd.Series) -> Dict[str, float]:
	y_pred = model.predict(X_test)
	metrics = {
		"model": name,
		"accuracy": accuracy_score(y_test, y_pred),
		"precision": precision_score(y_test, y_pred, average="macro", zero_division=0),
		"recall": recall_score(y_test, y_pred, average="macro", zero_division=0),
		"f1": f1_score(y_test, y_pred, average="macro", zero_division=0),
	}
	return metrics


def plot_confusion(name: str, y_true: pd.Series, y_pred: np.ndarray, labels: List[str], save_path: str) -> None:
	cm = confusion_matrix(y_true, y_pred, labels=labels)
	plt.figure(figsize=(5, 4))
	sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
	plt.title(f"Confusion Matrix - {name}")
	plt.xlabel("Predicted")
	plt.ylabel("Actual")
	plt.tight_layout()
	plt.savefig(save_path, dpi=150)
	plt.close()


def plot_model_comparison(df_metrics: pd.DataFrame, save_path: str) -> None:
	plt.figure(figsize=(7, 4))
	order = df_metrics.sort_values("accuracy", ascending=False)["model"]
	sns.barplot(data=df_metrics, x="model", y="accuracy", order=order, hue="model", palette="viridis", legend=False)
	plt.ylim(0, 1)
	plt.title("Model Accuracy Comparison")
	plt.ylabel("Accuracy")
	plt.xlabel("")
	plt.tight_layout()
	plt.savefig(save_path, dpi=150)
	plt.close()


def main() -> None:
	parser = argparse.ArgumentParser(description="Train and evaluate wood quality classifiers")
	parser.add_argument("--data", type=str, default="dataset.csv", help="Path to CSV dataset")
	parser.add_argument("--out", type=str, default="results", help="Output directory for metrics and plots")
	args = parser.parse_args()

	X, y = load_data(args.data)
	labels = sorted(y.unique())

	preprocessor = build_preprocessor(X)
	X_train, X_test, y_train, y_test = train_test_split(
		X, y, test_size=0.25, random_state=RANDOM_STATE, stratify=y
	)

	dirs = ensure_dirs(args.out)

	all_metrics: List[Dict[str, float]] = []
	models = get_models()

	for name, estimator in models.items():
		pipe = Pipeline(steps=[
			("preprocess", preprocessor),
			("model", estimator),
		])

		pipe.fit(X_train, y_train)

		# Save model
		model_path = os.path.join(dirs["out"], f"model_{name}.joblib")
		joblib.dump(pipe, model_path)

		# Evaluate
		y_pred = pipe.predict(X_test)
		metrics = {
			"model": name,
			"accuracy": accuracy_score(y_test, y_pred),
			"precision": precision_score(y_test, y_pred, average="macro", zero_division=0),
			"recall": recall_score(y_test, y_pred, average="macro", zero_division=0),
			"f1": f1_score(y_test, y_pred, average="macro", zero_division=0),
		}
		all_metrics.append(metrics)

		# Confusion matrix plot
		cm_path = os.path.join(dirs["plots"], f"confusion_matrix_{name}.png")
		plot_confusion(name, y_test, y_pred, labels, cm_path)

		# Classification report (text)
		report = classification_report(y_test, y_pred, labels=labels, zero_division=0)
		report_path = os.path.join(dirs["out"], f"classification_report_{name}.txt")
		with open(report_path, "w", encoding="utf-8") as f:
			f.write(report)

	# Save metrics CSV
	df_metrics = pd.DataFrame(all_metrics)
	metrics_csv = os.path.join(dirs["out"], "metrics.csv")
	df_metrics.to_csv(metrics_csv, index=False)

	# Comparison plot
	comparison_path = os.path.join(dirs["plots"], "model_comparison.png")
	plot_model_comparison(df_metrics, comparison_path)

	print("Saved:", metrics_csv)
	print("Saved plots to:", dirs["plots"])


if __name__ == "__main__":
	main()
