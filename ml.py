# Fixed run: correct sort_values usage and re-run remaining steps from coefficient inspection onward.
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve

# coef_df and fi_df creation (we assume previous models and data exist in this session)
# In this environment the previous successful portion created logreg, dt, feature_names, feature_names_tree, X_test_proc, X_test_tree, y_test, res_log, res_dt, results_df
# If any name is missing, recreate minimal objects from the earlier run by re-running generation — but here we assume continuation.

# Recompute coef_df safely
coef_df = pd.DataFrame({
    'feature': feature_names,
    'coefficient': logreg.coef_[0]
})
coef_df = coef_df.sort_values(by='coefficient', key=lambda s: s.abs(), ascending=False).reset_index(drop=True)
display_dataframe_to_user("Logistic regression coefficients (sorted by magnitude)", coef_df.head(20))

# Decision tree feature importances
fi_df = pd.DataFrame({
    'feature': feature_names_tree,
    'importance': dt.feature_importances_
}).sort_values('importance', ascending=False).reset_index(drop=True)
display_dataframe_to_user("Decision tree feature importances", fi_df.head(20))

# ROC plots (again) - one plot per model
fpr, tpr, _ = roc_curve(y_test, res_log['y_prob'])
plt.figure()
plt.plot(fpr, tpr)
plt.plot([0,1],[0,1])
plt.title("ROC Curve - Logistic Regression")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.grid(True)
plt.show()

fpr2, tpr2, _ = roc_curve(y_test, res_dt['y_prob'])
plt.figure()
plt.plot(fpr2, tpr2)
plt.plot([0,1],[0,1])
plt.title("ROC Curve - Decision Tree")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.grid(True)
plt.show()

print("SUMMARY:")
print(results_df.to_string(index=False))
print("\nNotes:")
print("- Dataset is synthetic to demonstrate the process end-to-end.")
print("- Logistic regression gives coefficients (useful to interpret direction of effect).")
print("- Decision tree captures non-linear interactions and gives feature importances.")
print("- For production you'd use a real dataset, cross-validation, hyperparameter tuning, and careful fairness checks.")

