from abc import ABC, abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def generate(self, prompt):
        pass

    @abstractmethod
    def analyze_incident(self, incident):
        pass

    @abstractmethod
    def remediation(self, incident):
        pass