# Exoplanet Detection with AI

## Overview

This project leverages artificial intelligence and machine learning techniques to analyze NASA's open-source exoplanet datasets, aiming to accurately identify exoplanets. The model is trained on data from missions like Kepler, K2, and TESS, and is designed to classify new data into categories such as Confirmed Exoplanet, Known Planet, False Positive, Ambiguous Planet Candidate, or Planet Candidate.

## Challenge Statement

Your challenge is to create an AI/ML model that is trained on one or more of the open-source exoplanet datasets offered by NASA and that can analyze new data to accurately identify exoplanets.
[Challenge Link](https://www.spaceappschallenge.org/2025/challenges/a-world-away-hunting-for-exoplanets-with-ai/)

## Dataset

* **Kepler**: Light curve data with classifications like Confirmed Exoplanet and False Positive.
* **TESS**: Light curve data with classifications such as Known Planet, Ambiguous Planet Candidate, and Planet Candidate.

## Model Architecture

* **Model Type**: [Specify the type of model used, e.g., Convolutional Neural Network, Transformer, etc.]
* **Input Features**: [List the features used, e.g., light curve data, stellar parameters, etc.]
* **Training Data**: [Specify the datasets and the number of samples used for training.]

## Performance Metrics

| Metric               | Value          |
| -------------------- | -------------- |
| Accuracy             | [Insert value] |
| Precision            | [Insert value] |
| Recall               | [Insert value] |
| F1 Score             | [Insert value] |
| Area Under ROC Curve | [Insert value] |

*These metrics were evaluated using a [cross-validation/split] approach with [number] folds/splits.*

## Installation

1. Clone the repository:

```bash
git clone [repository_url]
cd [repository_name]
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

To train the model:

```bash
python train.py --dataset [dataset_name] --epochs [number] --batch_size [number]
```

To evaluate the model:

```bash
python evaluate.py --model [model_path] --test_data [test_dataset]
```

## Results

The model achieved an accuracy of [insert accuracy]% on the test dataset, with precision, recall, and F1 score values indicating a balanced performance across all classes.

## Conclusion

This project demonstrates the potential of AI/ML models in automating the detection of exoplanets from large astronomical datasets. Future work will focus on improving model generalization and exploring additional features to enhance classification
