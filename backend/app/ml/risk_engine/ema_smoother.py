from app.config import settings

class EMAScoreSmoother:
    def __init__(self, alpha: float = None):
        self.alpha = alpha if alpha is not None else settings.EMA_ALPHA
        self._current_score = None
        self._history = []

    def update(self, raw_score: float) -> float:
        if self._current_score is None:
            self._current_score = raw_score
        else:
            self._current_score = (self.alpha * raw_score) + ((1 - self.alpha) * self._current_score)
            
        self._history.append(self._current_score)
        return self._current_score

    def reset(self):
        self._current_score = None
        self._history.clear()

    @property
    def current_score(self) -> float:
        return self._current_score if self._current_score is not None else 0.0

    @property
    def score_history(self) -> list[float]:
        return list(self._history)
