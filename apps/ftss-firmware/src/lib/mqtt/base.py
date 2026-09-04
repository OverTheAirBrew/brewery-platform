class MqttEvent:
    topic: str = ""
    
    def __init__(self):
      self.payload = None
    
    @classmethod
    def deserialize(cls, topic:str, raw: str):
      raise NotImplementedError("deserialize method must be implemented in subclasses")
    
    @classmethod
    def serialize(cls) -> str:
      raise NotImplementedError("serialize method must be implemented in subclasses")
    
    def handle(self, payload):
      raise NotImplementedError("handle method must be implemented in subclasses")
    
    def getT_topic(self) -> str:
      topic = type(self).topic
      if callable(topic):
        return topic(self.payload)
      return topic
    