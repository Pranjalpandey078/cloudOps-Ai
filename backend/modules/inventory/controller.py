from flask import request

from modules.inventory.service import InventoryService


class InventoryController:

    service = InventoryService()

    def create(self):
        data = request.get_json()
        return self.service.create(data)

    def get_all(self):
        return self.service.get_all()

    def get_one(self, server_id):
        return self.service.get_one(server_id)

    def update(self, server_id):
        data = request.get_json()
        return self.service.update(server_id, data)

    def delete(self, server_id):
        return self.service.delete(server_id)