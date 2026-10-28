"""
Recovery Intelligence Lab - Unit Tests for Metric Formulas & Arithmetic
"""

import pytest
import numpy as np

def calculate_relative_pct_change(prior: float, current: float) -> float:
    if prior == 0:
        return 0.0
    return ((current - prior) / prior) * 100

def calculate_pp_change(prior_rate: float, current_rate: float) -> float:
    return current_rate - prior_rate

def calculate_daily_run_rate(amount: float, days: int) -> float:
    if days <= 0:
        raise ValueError("Days must be positive non-zero integer.")
    return amount / days

def test_relative_vs_percentage_point_distinction():
    # Example: Rate increases from 20% to 22.2%
    prior_rate = 20.0
    current_rate = 22.2
    
    pp_diff = calculate_pp_change(prior_rate, current_rate)
    rel_change = calculate_relative_pct_change(prior_rate, current_rate)
    
    assert round(pp_diff, 2) == 2.20
    assert round(rel_change, 1) == 11.0

def test_zero_and_null_denominators():
    assert calculate_relative_pct_change(0, 100) == 0.0
    
    with pytest.raises(ValueError):
        calculate_daily_run_rate(50000.0, 0)

def test_february_march_calendar_normalization():
    # February 28 days vs March 31 days
    feb_clean_amount = 170142454.0
    mar_clean_amount = 188912374.0
    
    raw_mom = calculate_relative_pct_change(feb_clean_amount, mar_clean_amount)
    assert round(raw_mom, 2) == 11.03
    
    feb_daily = calculate_daily_run_rate(feb_clean_amount, 28)
    mar_daily = calculate_daily_run_rate(mar_clean_amount, 31)
    
    daily_mom = calculate_relative_pct_change(feb_daily, mar_daily)
    assert round(daily_mom, 2) == 0.29
    assert daily_mom < 1.0  # Demonstrates operational flatness

def test_calendar_day_ratio():
    # March (31 days) vs Feb (28 days) gives +10.71% baseline
    calendar_inflation = calculate_relative_pct_change(28, 31)
    assert round(calendar_inflation, 2) == 10.71
