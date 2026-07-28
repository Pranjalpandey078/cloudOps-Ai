from modules.inventory.repository import InventoryRepository
from shared.response import ApiResponse

class InventoryService:

    repository = InventoryRepository()

    def create(self, data):

        server_id = self.repository.create_server(data)

        from shared.response import ApiResponse

        return ApiResponse.success(
    message="Server registered successfully",
    data={
        "server_id": server_id
    }
)
    def get_all(self):

        servers = self.repository.get_all_servers()

        for server in servers:

            for key, value in server.items():

                if hasattr(value, "isoformat"):
                    server[key] = value.isoformat()

                elif hasattr(value, "quantize"):
                    server[key] = float(value)

        return ApiResponse.success(
            data=servers
        )

    def get_one(self, server_id):

        server = self.repository.get_server(server_id)

        if not server:
            return {
                "message": "Server not found"
            }, 404

        return server

    def update(self, server_id, data):

        exists = self.repository.get_server(server_id)

        if not exists:
            return {
                "message": "Server not found"
            }, 404

        affected = self.repository.update_server(server_id, data)

        if affected == 0:
            return {
                "message": "No data updated"
            }

        return {
            "message": "Server updated successfully"
        }

    def delete(self, server_id):

        exists = self.repository.get_server(server_id)

        if not exists:
            return ApiResponse.error(
                "Server not found",
                404
)

        self.repository.delete_server(server_id)

        return {
            "message": "Server deleted successfully"
        }