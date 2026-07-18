from modules.inventory.repository import InventoryRepository


class InventoryService:

    repository = InventoryRepository()


    def create(self, data):

        server_id = self.repository.create_server(data)

        return {

            "message":"Server registered successfully",

            "server_id":server_id

        }


    def get_all(self):

        return self.repository.get_all_servers()


    def get_one(self, server_id):

        server = self.repository.get_server(server_id)

        if not server:

            return {

                "message":"Server not found"

            },404

        return server