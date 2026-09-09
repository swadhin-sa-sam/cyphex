import { useState, useCallback } from 'react';
import { RISK_LEVELS } from '../utils/constants';
export function useRiskScore() {
    const [currentScore, setCurrentScore] = useState(0);
    const [riskLevel, setRiskLevel] = useState(RISK_LEVELS.LOW.label);
    const [scoreHistory, setScoreHistory] = useState(Array(60).fill(0));
    const [anomalyFlags, setAnomalyFlags] = useState([]);
    const [recommendation, setRecommendation] = useState("No action required.");
    const updateScore = useCallback((result) => {
        const score = result.score;
        setCurrentScore(score);
        setScoreHistory(prev => {
            const newHistory = [...prev.slice(1), score];
            return newHistory;
        });
        setAnomalyFlags(result.anomaly_flags || []);
        setRecommendation(result.recommendation || "No action required.");
        if (score >= RISK_LEVELS.CRITICAL.threshold) {
            setRiskLevel(RISK_LEVELS.CRITICAL.label);
        }
        else if (score >= RISK_LEVELS.HIGH.threshold) {
            setRiskLevel(RISK_LEVELS.HIGH.label);
        }
        else if (score >= RISK_LEVELS.MEDIUM.threshold) {
            setRiskLevel(RISK_LEVELS.MEDIUM.label);
        }
        else {
            setRiskLevel(RISK_LEVELS.LOW.label);
        }
    }, []);
    return { currentScore, riskLevel, scoreHistory, anomalyFlags, recommendation, updateScore };
}
