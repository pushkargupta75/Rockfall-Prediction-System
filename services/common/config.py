# Basic settings class and get_settings function
class Settings:
	def __init__(self):
		self.api_gateway_host = "localhost"
		self.api_gateway_port = 8000
		self.prediction_service_host = "localhost"
		self.prediction_service_port = 8001
		self.alert_manager_host = "localhost"
		self.alert_manager_port = 8002

def get_settings():
	return Settings()
