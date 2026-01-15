# Wood Quality Classification (Vendor Intake)

This mini ML module predicts wood quality (High, Medium, Low) from vendor intake features: `Vendor`, `WoodType`, `Length_cm`, `Width_cm`, `Thickness_cm`, `Moisture`, `Cost_per_unit`.

## Contents
- `dataset.csv`: sample dataset (synthetic)
- `train_evaluate.py`: trains 5 classifiers and saves metrics/plots
- `WoodQuality.ipynb`: interactive notebook with visuals (optional)
- `requirements.txt`: Python dependencies

## Quickstart
1. Create and activate a Python 3.10+ virtual environment.
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Train and evaluate all models:
```bash
python train_evaluate.py --data dataset.csv --out results
```
4. Review outputs:
- `results/metrics.csv` for model metrics
- `results/plots/model_comparison.png`
- `results/plots/confusion_matrix_<Model>.png`

## Models Included
- K-Nearest Neighbors (KNN)
- Naive Bayes (GaussianNB)
- Decision Tree (CART)
- Support Vector Machine (SVC, RBF)
- Neural Network (MLPClassifier)

## Notes
- The dataset is synthetic for demonstration. Replace `dataset.csv` with real intake data for production use.
- Categorical features (`Vendor`, `WoodType`) are one-hot encoded; numeric features are standardized.
